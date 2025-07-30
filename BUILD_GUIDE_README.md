# ActionManager Navigator - Build & Development Guide

**Quick Reference for Scripts, Builds, Testing, and Development Workflows**

---

## 📋 Table of Contents

1. [🚀 Quick Start Commands](#-quick-start-commands)
2. [📁 Configuration Files Overview](#-configuration-files-overview)
3. [🛠️ Build System Workflows](#️-build-system-workflows)
4. [🧪 Testing System](#-testing-system)
5. [⚙️ Configuration Deep Dive](#️-configuration-deep-dive)
6. [🔄 Development Workflows](#-development-workflows)
7. [📦 Production Deployment](#-production-deployment)
8. [🐛 Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start Commands

### **Most Common Commands**

```bash
# 🏗️ DEVELOPMENT
npm run dev-quick          # Quick development build + ready message
npm run dev                 # Development build only
npm run test:watch          # Run tests in watch mode

# 🚀 PRODUCTION  
npm run prod-ready          # Full validation + production build
npm run build               # Production build only

# 🧪 TESTING
npm run test                # Run all tests
npm run test:coverage       # Run tests with coverage report
npm run validate            # Lint + test + build (full validation)

# 🧹 UTILITIES
npm run clean               # Clean dist folder
npm run lint:fix            # Fix linting issues
```

### **Specialized Commands**

```bash
# 🔬 TEST ASSET GENERATION
npm run generate-assets     # Generate test assets for Photoshop testing
npm run parse-xml           # Parse XML expectations for tests
npm run build-tests         # Build + prepare tests for Photoshop
npm run copy-tests          # Instructions for copying tests to main computer

# 🔍 TESTING VARIANTS
npm run test:integration    # Integration tests only
npm run test:unit          # Unit tests only
```

---

## 📁 Configuration Files Overview

### **File Responsibility Matrix**

| File | Purpose | When It's Used |
|------|---------|----------------|
| **package.json** | 📋 Project metadata, scripts, dependencies | All npm commands |
| **tsconfig.json** | 🔧 TypeScript config for development/testing | `npm test`, IDE support |
| **tsconfig.build.json** | 🏗️ TypeScript config for production builds | `npm run build/prod` |
| **webpack.config.js** | 📦 Bundler config for ExtendScript output | `npm run dev/prod/build` |
| **jest.config.js** | 🧪 Testing framework configuration | `npm test` commands |

### **Configuration Relationships**

```mermaid
graph TD
    A[package.json] --> B[npm scripts]
    B --> C[webpack.config.js]
    B --> D[jest.config.js]
    B --> E[tsconfig.json]
    
    C --> F[tsconfig.build.json]
    C --> G[ES3Plugin]
    C --> H[dist/ActionDescriptorNavigator.js]
    
    D --> E
    D --> I[coverage/]
    
    subgraph "Development"
        E
        D
    end
    
    subgraph "Production Build"
        F
        C
        G
    end
```

---

## 🛠️ Build System Workflows

### **Build Flow Diagram**

```mermaid
flowchart TD
    A[Source: ActionManager/*.ts] --> B{Build Type?}
    
    B -->|Development| C[npm run dev]
    B -->|Production| D[npm run build]
    B -->|Quick Dev| E[npm run dev-quick]
    B -->|Validated Prod| F[npm run prod-ready]
    
    C --> G[webpack --mode=development]
    D --> H[webpack --mode=production]
    E --> G --> I[Echo: Development build ready]
    F --> J[Validate: lint + test + build] --> H --> K[Echo: Production build validated]
    
    G --> L[tsconfig.build.json]
    H --> L
    L --> M[ES3Plugin Processing]
    M --> N[dist/ActionDescriptorNavigator.js]
    
    subgraph "Output Files"
        N
        O[dist/types.d.ts]
        P[dist/ActionDescriptorNavigator.js.map]
    end
    
    L --> O
    L --> P
```

### **Build Command Options**

| Command | Use Case | Output | Speed |
|---------|----------|--------|-------|
| `npm run dev` | Development/debugging | With source maps | Fast |
| `npm run prod` | Production release | Optimized, no maps | Medium |
| `npm run dev-quick` | Quick iteration | Dev build + success message | Fast |
| `npm run prod-ready` | Release preparation | Fully validated production | Slow |
| `npm run build` | Alias for production | Same as `npm run prod` | Medium |

### **Build Lifecycle Hooks**

```bash
npm run build
    ↓
1. prebuild → npm run clean → rimraf dist
2. build → npm run prod → webpack --mode=production
3. postbuild → echo '✅ Build complete: dist/ActionDescriptorNavigator.js ready for ExtendScript'
```

---

## 🧪 Testing System

### **Test Command Matrix**

| Command | Purpose | Coverage | Watch Mode |
|---------|---------|----------|------------|
| `npm test` | Run all tests (with pre-lint) | All | No |
| `npm run test:watch` | Development testing | All | Yes |
| `npm run test:coverage` | Coverage analysis | All | No |
| `npm run test:unit` | Unit tests only | Unit files | No |
| `npm run test:integration` | Integration tests only | Integration files | No |

### **Test Workflow**

```mermaid
flowchart LR
    A[npm test] --> B[pretest: npm run lint]
    B --> C{Lint Pass?}
    C -->|No| D[❌ Lint Errors - Fix and retry]
    C -->|Yes| E[jest --testMatch tests/**/*.test.ts]
    E --> F[Test Results]
    
    subgraph "Test Types"
        G[Unit Tests: tests/**/*.test.ts]
        H[Integration Tests: tests/**/*.spec.ts]
    end
    
    E --> G
    E --> H
    
    subgraph "Coverage Output"
        I[coverage/html/index.html]
        J[coverage/lcov.info]
        K[Text coverage summary]
    end
    
    F --> I
    F --> J
    F --> K
```

### **Testing Special Workflows**

**Photoshop Test Preparation**:
```bash
npm run build-tests
    ↓
1. npm run build → webpack production build
2. npm run parse-xml → Parse XML test expectations  
3. echo '✅ Tests ready for Photoshop'
```

**Test Asset Generation**:
```bash
npm run generate-assets
    ↓
npx ts-node tests/generate-test-assets.ts → Generate .psd files for testing
```

---

## ⚙️ Configuration Deep Dive

### **TypeScript Configuration Strategy**

**tsconfig.json (Development)**:
```json
{
  "target": "es5",
  "include": ["action-manager/**/*", "tests/**/*"],
  "strict": true,
  "paths": { "@/*": ["./*"], "@tests/*": ["./tests/*"] }
}
```
- **Purpose**: Development, testing, IDE support
- **Includes**: Source code + tests
- **Features**: Strict typing, path mapping, source maps

**tsconfig.build.json (Production)**:
```json
{
  "extends": "./tsconfig.json",
  "include": ["ActionManager/**/*"],
  "exclude": ["tests", "**/*.test.ts", "**/*.spec.ts"]
}
```
- **Purpose**: Production builds only
- **Includes**: Source code only (no tests)
- **Features**: Faster builds, clean output

### **Webpack ExtendScript Strategy**

**Key Configuration Elements**:
```javascript
module.exports = {
    entry: './ActionManager/ActionDescriptorNavigator.ts',
    output: {
        filename: 'ActionDescriptorNavigator.js',
        library: 'ActionDescriptorNavigator',
        libraryTarget: 'var'  // ExtendScript compatible
    },
    plugins: [new ES3Plugin()],  // ES3 compatibility
    optimization: { minimize: false }  // Keep readable
};
```

**ExtendScript Compatibility Features**:
- ✅ **ES3Plugin**: Converts modern JS to ES3
- ✅ **libraryTarget: 'var'**: Creates global variable
- ✅ **minimize: false**: Keeps code readable for debugging
- ✅ **tsconfig.build.json**: ES5 target with CommonJS modules

### **Jest Testing Strategy**

**Test Environment Setup**:
```javascript
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { target: 'es5' } }] },
    moduleNameMapping: { '^@/(.*)$': '<rootDir>/$1' }
};
```

**Coverage Configuration**:
- **Includes**: `ActionManager/**/*.ts`
- **Excludes**: Type definitions, node_modules
- **Reporters**: Text, LCOV, HTML

---

## 🔄 Development Workflows

### **Daily Development Cycle**

```mermaid
flowchart TD
    A[Start Development] --> B[npm run dev-quick]
    B --> C[Make Changes]
    C --> D[npm run test:watch]
    D --> E{Tests Pass?}
    E -->|No| F[Fix Issues] --> C
    E -->|Yes| G[Continue Development] --> C
    
    H[Ready to Commit] --> I[npm run validate]
    I --> J{Validation Pass?}
    J -->|No| K[Fix Issues] --> I
    J -->|Yes| L[Commit & Push]
    
    subgraph "Quality Gates"
        M[Lint Check]
        N[All Tests Pass]
        O[Build Success]
    end
    
    I --> M --> N --> O
```

### **Feature Development Workflow**

1. **Start Feature**: `npm run dev-quick`
2. **Develop with Tests**: `npm run test:watch`
3. **Pre-commit Check**: `npm run validate`
4. **Final Build**: `npm run prod-ready`

### **Bug Fix Workflow**

1. **Reproduce**: Create test case
2. **Fix**: Make minimal changes
3. **Verify**: `npm run test:coverage`
4. **Validate**: `npm run validate`

---

## 📦 Production Deployment

### **Release Preparation Workflow**

```mermaid
flowchart TD
    A[Ready for Release] --> B[npm run prod-ready]
    B --> C[Full Validation]
    C --> D{All Checks Pass?}
    D -->|No| E[Fix Issues] --> B
    D -->|Yes| F[Production Build Created]
    
    F --> G[dist/ActionDescriptorNavigator.js]
    F --> H[dist/types.d.ts]
    
    G --> I[Ready for ExtendScript]
    H --> J[Ready for TypeScript consumers]
    
    subgraph "Validation Steps"
        K[ESLint Check]
        L[All Tests Pass]
        M[Production Build]
        N[Success Confirmation]
    end
    
    C --> K --> L --> M --> N
```

### **Build Outputs**

| File | Purpose | Consumer |
|------|---------|----------|
| `dist/ActionDescriptorNavigator.js` | 🎯 Main library file | ExtendScript runtime |
| `dist/types.d.ts` | 📝 TypeScript definitions | TypeScript development |
| `dist/ActionDescriptorNavigator.js.map` | 🗺️ Source map (dev only) | Debugging |

### **Distribution Package**

**Files included in npm package** (from `package.json` files array):
```
dist/**/*                    # Built library files
ActionManager/types.ts       # Source types
es5-polyfills.js            # ExtendScript compatibility
README.md                   # Documentation
LICENSE                     # License file
CHANGELOG.md               # Version history
```

---

## 🐛 Troubleshooting

### **Common Issues & Solutions**

#### **Build Failures**

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot find module '@/*'` | Path mapping issue | Check `tsconfig.json` paths config |
| `ES3Plugin error` | Webpack compatibility | Verify `webpack-es3-plugin` version |
| `TypeScript errors` | Type issues | Run `npm run lint:fix` |

#### **Test Failures**

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot resolve '@tests/*'` | Jest path mapping | Check `jest.config.js` moduleNameMapping |
| `Coverage threshold` | Low test coverage | Add more tests or adjust thresholds |
| `ts-jest transform` | TypeScript compilation | Check Jest TypeScript config |

#### **Development Issues**

| Problem | Cause | Solution |
|---------|-------|----------|
| Slow builds | Development mode overhead | Use `npm run dev-quick` for iteration |
| Watch mode errors | File system issues | Restart `npm run test:watch` |
| ES3 compatibility | Modern JS features | Stick to ES5 patterns, use polyfills |

### **Debug Commands**

```bash
# Clean start
npm run clean && npm run dev

# Verbose testing
npm run test -- --verbose

# Coverage details
npm run test:coverage && open coverage/html/index.html

# Lint details
npm run lint -- --format=detailed

# Build with debug
DEBUG=webpack npm run dev
```

### **Environment Requirements**

- **Node.js**: >=12.0.0
- **npm**: >=6.0.0
- **Memory**: Webpack builds can be memory-intensive
- **Platform**: Cross-platform (Windows, macOS, Linux)

---

## 📊 Performance & Optimization

### **Build Performance**

| Command | Typical Time | Memory Usage | Output Size |
|---------|-------------|--------------|-------------|
| `npm run dev` | ~3-5 seconds | ~200MB | ~100KB |
| `npm run prod` | ~5-8 seconds | ~250MB | ~80KB |
| `npm test` | ~10-15 seconds | ~300MB | Coverage reports |

### **Optimization Tips**

1. **Development**: Use `npm run dev-quick` for faster iteration
2. **Testing**: Use `npm run test:watch` during development
3. **CI/CD**: Use `npm run validate` for comprehensive checks
4. **Production**: Use `npm run prod-ready` for releases

**RECOMMENDED FILENAME**: `BUILD_GUIDE.md` or `DEVELOPMENT_GUIDE.md`

This guide serves as a comprehensive reference for all build, test, and development operations without replacing the main project README.md.


-------
CHAT SUMMARY:
I've created a comprehensive **BUILD & DEVELOPMENT GUIDE** that serves as your complete reference for all configuration files, scripts, and workflows. Here's what it covers:

## 📋 **What This Guide Provides**

**Immediate Value:**
- 🚀 **Quick Start Commands** - Most common operations at the top
- 📊 **Visual Workflows** - Mermaid diagrams showing build flows and relationships  
- 🎯 **Command Matrix** - What each script does, when to use it
- 🔧 **Configuration Relationships** - How all 5 config files work together

## 🏗️ **Key Insights from Your Configuration Analysis**

**Smart Architecture Choices:**
- **Dual TypeScript Configs**: `tsconfig.json` (dev+tests) vs `tsconfig.build.json` (production only)
- **ExtendScript Optimization**: Webpack specifically configured for ES3 compatibility with ES3Plugin
- **Workflow Automation**: Excellent use of npm script hooks (`prebuild`, `postbuild`, `pretest`)
- **Developer Experience**: Helper scripts like `dev-quick` and `prod-ready` with success messages

**Build System Flow:**
```
Source (ActionManager/*.ts) 
  → TypeScript (ES5) 
  → Webpack (ES3Plugin) 
  → ExtendScript-compatible output
```

## 🎯 **Recommended Usage Patterns**

**Daily Development:**
```bash
npm run dev-quick      # Quick iteration
npm run test:watch     # Continuous testing
npm run validate       # Pre-commit check
```

**Production Release:**
```bash
npm run prod-ready     # Full validation + build
```

**Specialized Workflows:**
```bash
npm run build-tests    # Prepare tests for Photoshop
npm run generate-assets # Create test .psd files
```

## 📁 **File Recommendation**

**Suggested filename**: `BUILD_GUIDE.md` or `DEVELOPMENT_GUIDE.md`

This should be a **single comprehensive guide** because:
- ✅ All configurations are interconnected
- ✅ Workflows span multiple tools
- ✅ Single reference point is easier to maintain
- ✅ Visual diagrams show relationships clearly

The guide provides both **quick reference** (common commands at top) and **deep understanding** (configuration relationships, troubleshooting) in one place. It complements rather than replaces your main README.md by focusing specifically on the build/development toolchain.
# Dev Platform
<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]
[![GitHub][github-shield]][github-url]

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#description">Description</a></li>
        <li><a href="#planned-features">Planned Features</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#configuration">Configuration</a></li>
        <li><a href="#usage">Usage</a></li>
        <li><a href="#shared-packages">Shared Packages</a></li>
        <li><a href="#tests">Tests</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a>
      <ul>
        <li><a href="#license">License</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
<a name="about-the-project"></a>
# 🧠 About The Project

<p align="center">
  <strong>Dev Platform — Shared development foundations for independent applications</strong>
</p>

<a name="description"></a>
### ℹ️ Description

Dev Platform is a personal internal development platform built as an npm Workspaces monorepo. Its goal is to centralize reusable tooling, configurations and, progressively, frontend and backend packages consumed by independent applications.

Instead of duplicating configuration files and maintaining different tooling conventions across repositories, applications adopt versioned shared packages and centralized presets from a single place.

- 📦 Centralized, independently versioned packages under the `@nlabrazi` scope with bundled tooling dependencies.
- 🧹 `@nlabrazi/config-biome` (`0.2.0`) — Shared Biome v2 configuration (JS, TS, Vue) with bundled `@biomejs/biome`.
- 📐 `@nlabrazi/tsconfig` (`0.1.0`) — Shared TypeScript configurations (`base.json`, `node.json`, `nuxt.json`) with bundled `typescript`.
- 🧪 `@nlabrazi/config-vitest` (`0.1.0`) — Shared Vitest helper (`defineSharedVitestConfig`) with Nuxt/Vue aliases and bundled test runner dependencies.
- 🎭 `@nlabrazi/config-playwright` (`0.1.0`) — Shared Playwright E2E helper (`defineSharedPlaywrightConfig`) with bundled `@playwright/test`.
- 🔄 Centralized Renovate preset (`configs/renovate/base.json`) grouping `@nlabrazi/*` updates and non-major updates to prevent PR fatigue.
- 🚀 Jenkins pipeline (`Jenkinsfile`) dynamically validating and publishing all workspace packages to GitHub Packages with Telegram notifications via `nabster-ci`.

---

<a name="planned-features"></a>
## 🚀 Planned Features

- 🧱 Reusable Nuxt Layer (`@nlabrazi/nuxt-layer`) for common application conventions, Tailwind and UI foundations.
- 🎨 A reusable Vue UI kit with customizable components (navigation, footers, cards, forms).
- 🧰 Application starter templates consuming the same shared packages.
- 🧩 Additional backend-oriented packages when concrete reuse cases emerge.

---

<a name="built-with"></a>
### 🏗️ Built With

* [![Node.js][NodeJS.io]][NodeJS-url]
* [![npm][npm.io]][npm-url]
* [![TypeScript][TypeScript.io]][TypeScript-url]
* [![Biome][Biome.io]][Biome-url]
* [![GitHub][GitHubPackages.io]][GitHubPackages-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
<a name="getting-started"></a>
# ✅ Getting Started

Dev Platform uses Node.js 26, npm Workspaces and Biome 2. The repository is a collection of shared packages and presets, not a standalone web application or service.

<a name="installation"></a>
### 💻 Installation

```bash
# Clone the repository
git clone https://github.com/nlabrazi/dev-platform.git
cd dev-platform

# Select the version declared in .nvmrc
nvm install
nvm use

# Install workspace dependencies
npm install

# List the packages recognized by npm
npm ls --workspaces --depth=0
```

<a name="configuration"></a>
### 🧩 Configuration

The root `package.json` declares the `packages/*` workspaces and remains private, while individual packages are published separately to GitHub Packages.

The root `.npmrc` maps the `@nlabrazi` scope to GitHub Packages:

```ini
@nlabrazi:registry=https://npm.pkg.github.com
```

GitHub Packages requires npm authentication for installation and publication. Keep credentials in your user-level npm configuration or CI secret store (`github-packages-publish`); **never commit access tokens**.

<a name="usage"></a>
### ▶️ Usage

```bash
# Inspect available workspaces
npm ls --workspaces --depth=0

# Check formatting and linting across the monorepo
npm run check

# Preview the contents of all shared packages without publishing
npm run pack:check
```

<a name="shared-packages"></a>
### 📦 Shared Packages & Presets

Current workspace structure:

```text
dev-platform/
├── configs/
│   └── renovate/
│       └── base.json
├── packages/
│   ├── config-biome/
│   │   ├── configs/
│   │   │   └── recommended.json
│   │   ├── biome-manifest.json
│   │   └── package.json
│   ├── config-playwright/
│   │   ├── index.d.ts
│   │   ├── index.js
│   │   └── package.json
│   ├── config-vitest/
│   │   ├── index.d.ts
│   │   ├── index.js
│   │   └── package.json
│   └── tsconfig/
│       ├── base.json
│       ├── node.json
│       ├── nuxt.json
│       └── package.json
├── Jenkinsfile
├── biome.json
├── package.json
├── package-lock.json
├── renovate.json
├── .npmrc
└── .nvmrc
```

#### 1. `@nlabrazi/config-biome` (`0.2.0`)
Shared Biome v2 configuration with 2-space indentation, 100-character line width, single quotes, `asNeeded` semicolons, Git VCS integration, recommended lint rules, import organization, and `.vue` overrides. Bundles `@biomejs/biome`.

```json
{
  "extends": ["@nlabrazi/config-biome/configs/recommended"]
}
```

#### 2. `@nlabrazi/tsconfig` (`0.1.0`)
Shared TypeScript configurations (`base.json`, `node.json`, `nuxt.json`) bundling `typescript`.

```json
{
  "extends": "@nlabrazi/tsconfig/base.json"
}
```

#### 3. `@nlabrazi/config-vitest` (`0.1.0`)
Shared Vitest configuration helper with Nuxt/Vue path aliases (`~`, `@`, `~~`, `@@`, `#shared`, `#server`), standard exclusions, and bundled `vitest`, `@vitest/coverage-v8`, `@vitejs/plugin-vue`, `@vue/test-utils`, and `happy-dom`.

```ts
import { defineSharedVitestConfig } from '@nlabrazi/config-vitest'

export default defineSharedVitestConfig(import.meta.url)
```

#### 4. `@nlabrazi/config-playwright` (`0.1.0`)
Shared Playwright configuration helper with unified local dev server vs CI behavior, optional mobile viewports (`mobile: true`), and bundled `@playwright/test`.

```ts
import { defineSharedPlaywrightConfig } from '@nlabrazi/config-playwright'

export default defineSharedPlaywrightConfig({ port: 3000 })
```

#### 5. Renovate Base Preset (`configs/renovate/base.json`)
Centralized Renovate preset targeting `staging`, grouping `@nlabrazi/*` updates into a single PR, and grouping non-major updates together.

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>nlabrazi/dev-platform//configs/renovate/base"]
}
```

<a name="tests"></a>
### 🧪 Tests

```bash
# Validate formatting and linting across the repository
npm run check

# Check all workspace package tarballs prior to publication
npm run pack:check

# Inspect the workspace dependency graph
npm ls --workspaces --depth=0
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
<a name="contributing"></a>
# 🙌 Contributing

Dev Platform evolves incrementally: each shared package should solve a demonstrated duplication problem without introducing unnecessary coupling between applications.

To contribute:
1. 🍴 Fork the repository
2. 🔧 Create a dedicated branch (`git checkout -b feat/my-feature`)
3. 💬 Commit your changes (`git commit -m "feat: add my feature"`)
4. 🚀 Push your branch (`git push origin feat/my-feature`)
5. 📨 Open a Pull Request

For changes to an existing package, validate its configuration and consider the impact on consuming applications before release.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
<a name="license"></a>
### 📄 License

This repository currently does not include an explicit license file.

In practice, the code is not formally distributed under a declared open source license. Publishing a package to a registry does not, by itself, grant permission to reuse or redistribute its source. Add a `LICENSE` file if public reuse is intended.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
<a name="contact"></a>
### 📬 Contact

- 👤 [GitHub Profile][github-url]
- 📨 [Open an issue][issues-url]
- 📁 [Project Repository](https://github.com/nlabrazi/dev-platform)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/nlabrazi/dev-platform.svg?style=for-the-badge
[contributors-url]: https://github.com/nlabrazi/dev-platform/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/nlabrazi/dev-platform.svg?style=for-the-badge
[forks-url]: https://github.com/nlabrazi/dev-platform/network/members
[stars-shield]: https://img.shields.io/github/stars/nlabrazi/dev-platform.svg?style=for-the-badge
[stars-url]: https://github.com/nlabrazi/dev-platform/stargazers
[issues-shield]: https://img.shields.io/github/issues/nlabrazi/dev-platform.svg?style=for-the-badge
[issues-url]: https://github.com/nlabrazi/dev-platform/issues
[license-shield]: https://img.shields.io/badge/license-not%20specified-lightgrey.svg?style=for-the-badge
[license-url]: #license
[github-shield]: https://img.shields.io/badge/GitHub-nlabrazi-181717.svg?style=for-the-badge&logo=github&logoColor=white
[github-url]: https://github.com/nlabrazi
[NodeJS.io]: https://img.shields.io/badge/Node.js_26-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white
[NodeJS-url]: https://nodejs.org/
[npm.io]: https://img.shields.io/badge/npm_Workspaces-CB3837?style=for-the-badge&logo=npm&logoColor=white
[npm-url]: https://docs.npmjs.com/cli/using-npm/workspaces
[TypeScript.io]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Biome.io]: https://img.shields.io/badge/Biome-60A5FA?style=for-the-badge&logo=biome&logoColor=white
[Biome-url]: https://biomejs.dev/
[GitHubPackages.io]: https://img.shields.io/badge/GitHub_Packages-181717?style=for-the-badge&logo=github&logoColor=white
[GitHubPackages-url]: https://docs.github.com/en/packages

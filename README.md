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

Instead of duplicating configuration files and maintaining different tooling conventions across repositories, applications will adopt versioned shared packages at their own pace.

- 📦 Centralized, independently versioned packages under the `@nlabrazi` scope.
- 🧹 Shared Biome configuration for consistent formatting, linting and import organization.
- 🔗 npm Workspaces for local package development and linking.
- 🔐 GitHub Packages selected as the distribution registry; initial publication is being prepared.
- 🧪 Changes are validated before adoption by consuming applications.
- 🛡️ Designed to complement Jenkins, Renovate and Sentinel without replacing them.

**Current status:** the first package, `@nlabrazi/config-biome`, is implemented and validated locally. External publication and automated release workflows are not configured yet.

---

<a name="planned-features"></a>
## 🚀 Planned Features

- 📚 Shared TypeScript, testing and Tailwind configurations.
- 🧱 Reusable Nuxt Layer for common application conventions and features.
- 🎨 A reusable Vue UI kit with customizable components (navigation, footers, cards, forms).
- 🧰 Application starter templates consuming the same shared packages.
- 🔄 Renovate-driven dependency maintenance across the platform and consuming repositories.
- 🚀 Jenkins pipelines for testing, versioning and publishing packages to GitHub Packages.
- 📊 Sentinel integration for visibility into package versions, releases and application adoption.
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

Dev Platform currently uses Node.js 26, npm Workspaces and Biome 2. The repository is a collection of shared packages, not a standalone web application or service.

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
npm ls --workspaces
```

<a name="configuration"></a>
### 🧩 Configuration

The root `package.json` declares the `packages/*` workspaces and remains private, while individual packages can be published separately.

The root `.npmrc` maps the `@nlabrazi` scope to GitHub Packages:

```ini
@nlabrazi:registry=https://npm.pkg.github.com
```

GitHub Packages requires npm authentication for installation and publication. Keep credentials in your user-level npm configuration or CI secret store; **never commit access tokens**. Publishing is not yet automated.

<a name="usage"></a>
### ▶️ Usage

```bash
# Inspect available workspaces
npm ls --workspaces

# Check the root Biome configuration, which extends the shared package
npx biome check biome.json

# Preview the contents of the shared Biome package without publishing
npm pack --workspace @nlabrazi/config-biome --dry-run
```

The root `biome.json` consumes the shared configuration via:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.6.5/schema.json",
  "extends": ["@nlabrazi/config-biome/configs/recommended"]
}
```

<a name="shared-packages"></a>
### 📦 Shared Packages

Current workspace structure:

```text
dev-platform/
├── packages/
│   └── config-biome/
│       ├── configs/
│       │   └── recommended.json
│       ├── biome-manifest.json
│       └── package.json
├── biome.json
├── package.json
├── package-lock.json
├── .npmrc
└── .nvmrc
```

#### `@nlabrazi/config-biome`

The first package provides a shared Biome configuration with two-space indentation, a 100-character line width, recommended lint rules and import organization. It uses Biome's package configuration manifest and is currently at `0.1.0`.

Once published and accessible through GitHub Packages, consuming projects will be able to install a specific version rather than copy the configuration files. Each application keeps its own `package.json` and lockfile so builds remain reproducible and deployments independent.

<a name="tests"></a>
### 🧪 Tests

```bash
# Validate the shared configuration used at the repository root
npx biome check biome.json

# Check package contents prior to publication
npm pack --workspace @nlabrazi/config-biome --dry-run

# Inspect the workspace dependency graph
npm ls --workspaces
```

These commands validate the current initial package. Automated unit tests and Jenkins pipelines will be introduced as the platform grows.

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

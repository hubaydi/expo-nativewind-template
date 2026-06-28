# expo-nativewind-template

A starting template for Expo apps with NativeWind v5 + Tailwind v4 pre-configured.

## Stack

- Expo SDK 54, Expo Router v6, React Native 0.81, React 19
- NativeWind v5 + Tailwind CSS v4 (via react-native-css)
- TypeScript (strict) with `@/*` path alias
- pnpm

## Usage

1. Click **"Use this template"** on GitHub → create a new repository
2. Clone your new repo
3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Rename the project to your app:

   ```bash
   pnpm rename
   ```

   You'll be prompted for project name, iOS bundle id, and Android package.

5. Start developing:

   ```bash
   pnpm start
   ```

## AI pair-programming

This template ships vendored Expo skills in `.agents/skills/` and an
`AGENTS.md` that pins the exact Expo SDK version docs to read. Compatible
with opencode, Claude Code, and similar agentic tools.

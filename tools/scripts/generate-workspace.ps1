# One-off bootstrap script: generates every library of the workspace with the correct tags.
# Kept in the repo as executable documentation of the library layout (see docs/ARCHITECTURE.md).
$ErrorActionPreference = 'Continue'

function Gen-Ts($path, $name, $import, $tags, $tests = 'vitest') {
  npx nx g @nx/js:library $path --name=$name --importPath=$import --unitTestRunner=$tests --bundler=none --linter=eslint --tags="$tags" --no-interactive 2>&1 | Select-String -Pattern 'View Details|error' -CaseSensitive:$false
}

function Gen-Ng($path, $name, $import, $prefix, $tags) {
  npx nx g @nx/angular:library $path --name=$name --importPath=$import --unitTestRunner=vitest-analog --linter=eslint --standalone --skipModule --prefix=$prefix --style=scss --tags="$tags" --no-interactive 2>&1 | Select-String -Pattern 'View Details|error' -CaseSensitive:$false
}

# ---- core (pure TS) --------------------------------------------------------
Gen-Ts 'libs/core/application' 'core-application' '@senbilan/core/application' 'layer:core,kind:application'

# ---- shared ----------------------------------------------------------------
Gen-Ts 'libs/shared/util' 'shared-util' '@senbilan/shared/util' 'layer:shared,kind:util'
Gen-Ng 'libs/shared/ng' 'shared-ng' '@senbilan/shared/ng' 'app' 'layer:shared,kind:util-ng'
Gen-Ng 'libs/shared/config' 'shared-config' '@senbilan/shared/config' 'app' 'layer:shared,kind:util-ng'
Gen-Ng 'libs/shared/i18n' 'shared-i18n' '@senbilan/shared/i18n' 'app' 'layer:shared,kind:i18n'
Gen-Ng 'libs/shared/query' 'shared-query' '@senbilan/shared/query' 'app' 'layer:shared,kind:state'
Gen-Ng 'libs/shared/auth' 'shared-auth' '@senbilan/shared/auth' 'app' 'layer:shared,kind:state'
Gen-Ng 'libs/shared/theme' 'shared-theme' '@senbilan/shared/theme' 'app' 'layer:shared,kind:state'
Gen-Ng 'libs/shared/command' 'shared-command' '@senbilan/shared/command' 'app' 'layer:shared,kind:state'
Gen-Ng 'libs/shared/testing' 'shared-testing' '@senbilan/shared/testing' 'app' 'layer:shared,kind:testing'

# ---- design system ----------------------------------------------------------
Gen-Ts 'libs/design-system/tokens' 'design-system-tokens' '@senbilan/design-system/tokens' 'layer:shared,kind:tokens' 'none'
Gen-Ng 'libs/design-system/icons' 'design-system-icons' '@senbilan/design-system/icons' 'app' 'layer:shared,kind:ui'
Gen-Ng 'libs/design-system/layout' 'design-system-layout' '@senbilan/design-system/layout' 'app' 'layer:shared,kind:ui'

# ---- platform -----------------------------------------------------------------
Gen-Ng 'libs/platform/core' 'platform-core' '@senbilan/platform/core' 'app' 'layer:shared,kind:platform'
Gen-Ng 'libs/platform/mobile' 'platform-mobile' '@senbilan/platform/mobile' 'app' 'layer:infra,kind:infrastructure,platform:mobile'

# ---- infrastructure -----------------------------------------------------------
Gen-Ng 'libs/infra/api' 'infra-api' '@senbilan/infra/api' 'app' 'layer:infra,kind:infrastructure'
Gen-Ng 'libs/infra/storage' 'infra-storage' '@senbilan/infra/storage' 'app' 'layer:infra,kind:infrastructure'
Gen-Ng 'libs/infra/mock' 'infra-mock' '@senbilan/infra/mock' 'app' 'layer:infra,kind:infrastructure'
Gen-Ng 'libs/infra/observability' 'infra-observability' '@senbilan/infra/observability' 'app' 'layer:infra,kind:infrastructure'

# ---- entities -------------------------------------------------------------------
foreach ($e in @('user', 'role', 'permission', 'notification')) {
  Gen-Ng "libs/entities/$e" "entity-$e" "@senbilan/entities/$e" 'entity' 'layer:entities,kind:entity'
}

# ---- features -------------------------------------------------------------------
foreach ($f in @('auth', 'dashboard', 'users', 'roles', 'permissions', 'settings', 'notifications', 'profile')) {
  Gen-Ng "libs/features/$f" "feature-$f" "@senbilan/features/$f" $f 'layer:features,kind:feature'
}

# ---- mobile application ---------------------------------------------------------
npx nx g @nx/angular:application apps/mobile --name=mobile --prefix=mobile --style=scss --routing --standalone --unitTestRunner=vitest-analog --e2eTestRunner=none --bundler=esbuild --ssr=false --tags="layer:app,kind:app,platform:mobile" --no-interactive 2>&1 | Select-String -Pattern 'View Details|error' -CaseSensitive:$false

Write-Host 'DONE generate-workspace'

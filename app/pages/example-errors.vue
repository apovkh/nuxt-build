<script setup lang="ts">
import type { DemoErrorResult } from '~/repositories/example/useDemoErrorRepository'
import { setApiErrorNotifier } from '~/core/utils/handleApiError'
import { rules } from '~/core/utils/validation'

definePageMeta({
  hasCode: true, // 2-column grid already on SSR (see default.vue)
  title: 'Error handling — different request types',
  subtitle: 'A single pipeline: normalizeApiError → handleGlobalApiError → notifier (toast) + local useApiError for status-based branching. Below — how an error surfaces in each request type.',
  maxWidth: 'max-w-[1600px]',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Error handling' },
  ],
})

const demo = useDemoErrorRepository()

// 401 is deliberately missing from the buttons: it triggers an auto-redirect to /login
// (createHttp.onResponseError) and would take the user away from the page.
const STATUSES = [400, 403, 404, 422, 500] as const

// ── Global notifier → toasts ─────────────────────────────────────────────────
// The core never calls setApiErrorNotifier anywhere (only in the README). We hook
// it up on the client to make the global step visible: everything that reaches
// handleGlobalApiError (useApi, TanStack cache) pops up as a toast.
interface DemoToast { id: number, statusCode: number, message: string }
const toasts = ref<DemoToast[]>([])
let toastId = 0

onMounted(() => {
  setApiErrorNotifier((e) => {
    const id = ++toastId
    toasts.value = [{ id, statusCode: e.statusCode, message: e.message }, ...toasts.value]
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 4000)
  })
})
// Remove our notifier on the way out so we don't keep a closure over this page.
onBeforeUnmount(() => setApiErrorNotifier(() => {}))

// ── 1) One-off: useApi + useApiError ─────────────────────────────────────────
const {
  isError: onceIsError,
  message: onceMessage,
  status: onceStatus,
  isForbidden,
  isNotFound,
  isValidation,
  isServerError,
  handleError: captureOnceError,
  resetError: resetOnceError,
} = useApiError()

const oncePending = ref(false)

async function runOnce(status: number) {
  resetOnceError()
  oncePending.value = true
  try {
    await demo.requestOnce(status) // useApi: global toast + re-throw
  }
  catch (e) {
    captureOnceError(e) // local state + per-status badges
  }
  finally {
    oncePending.value = false
  }
}

function badge(active: boolean) {
  return active
    ? 'rounded bg-success/15 px-2 py-0.5 text-xs text-success'
    : 'rounded bg-muted px-2 py-0.5 text-xs text-secondary'
}

// ── 2) Cached query: useClientQuery ──────────────────────────────────────────
// enabled: false → the query starts only manually via refetch().
const {
  error: queryError,
  isFetching: queryFetching,
  refetch: refetchQuery,
} = useClientQuery({ ...demo.statusQuery(500), enabled: false })

const queryStarted = ref(false)
const queryErrorInfo = computed(() => (queryError.value ? normalizeApiError(queryError.value) : null))

async function runQuery() {
  queryStarted.value = true
  await refetchQuery()
}

// ── 3) Mutation: useApiMutation ──────────────────────────────────────────────
const {
  mutate: runMutation,
  isPending: mutationPending,
  error: mutationError,
} = useApiMutation<DemoErrorResult, void>({ mutationFn: () => demo.request(500) })

const mutationErrorInfo = computed(() => (mutationError.value ? normalizeApiError(mutationError.value) : null))

// ── 4) Form: useForm + server-side validation (422 → field errors) ───────────
// The values pass client validation → the request reaches the server, which returns
// 422 with a [field, rule, params] array. useForm maps it into errors unchanged.
const {
  form: loginForm,
  errors: loginErrors,
  pending: loginPending,
  success: loginSuccess,
  send: submitLogin,
  validateField: validateLoginField,
} = useForm(
  () => demo.request(422),
  { email: 'user@example.com', password: 'secret123' },
  undefined,
  {
    email: [rules.required, rules.email],
    password: [rules.required, rules.minLength(8)],
  },
)

usePageCode([
  {
    title: 'Pipeline (core)',
    code: `// normalizeApiError: anything → { statusCode, message, data }
// handleGlobalApiError: normalize → log → notifier (toast).
// Called globally from the TanStack cache and from useApi.

// Wiring up the toast (usually once, in a plugin):
setApiErrorNotifier((e) => useNuxtApp().$toast.error(e.message))`,
  },
  {
    title: '1 · useApi + useApiError',
    code: `const { message, status, isNotFound, isServerError,
        handleError, resetError } = useApiError()

async function runOnce(status: number) {
  resetError()
  try {
    await demo.requestOnce(status) // useApi: toast + re-throw
  }
  catch (e) {
    handleError(e) // local state + per-status branches
  }
}`,
  },
  {
    title: '2 · useClientQuery / 3 · useApiMutation',
    code: `// Cached query: the error lives in reactive error, the toast comes from the TanStack cache
const { error, refetch } = useClientQuery({
  ...demo.statusQuery(500), enabled: false,
})

// Mutation: error in state + onError → handleGlobalApiError (toast)
const { mutate, error } = useApiMutation({
  mutationFn: () => demo.request(500),
})`,
  },
  {
    title: '4 · useForm (422 → fields)',
    code: `// The same errors: client-side rules + server-side 422
const { form, errors, send, validateField } = useForm(
  () => demo.request(422), // the server returns [[field, rule, params]]
  { email: 'user@example.com', password: 'secret123' },
  undefined,
  { email: [rules.required, rules.email],
    password: [rules.required, rules.minLength(8)] },
)`,
  },
])
</script>

<template>
  <div>
    <!-- Global toasts — the result of setApiErrorNotifier → handleGlobalApiError -->
    <div class="pointer-events-none fixed right-4 top-4 z-50 w-72 space-y-2">
      <TransitionGroup name="fade">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="rounded border border-error/30 bg-error/10 p-3 text-sm shadow-sm"
        >
          <div class="font-medium text-error">
            Global toast · {{ t.statusCode || '—' }}
          </div>
          <div class="text-secondary">
            {{ t.message }}
          </div>
        </div>
      </TransitionGroup>
    </div>

    <div class="space-y-6">
      <!-- 1) One-off -->
      <section class="rounded border border-border p-4">
        <h2 class="font-medium">
          1 · One-off — <code class="text-brand-primary">useApi</code> + <code class="text-brand-primary">useApiError</code>
        </h2>
        <p class="mt-1 text-sm text-secondary">
          Click → a request with the chosen status. useApi notifies globally (toast) and re-throws;
          useApiError normalizes into local state and provides status-based branches.
        </p>

        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="s in STATUSES"
            :key="s"
            type="button"
            class="rounded border border-border px-3 py-1.5 text-sm transition hover:border-brand-primary disabled:opacity-50"
            :disabled="oncePending"
            @click="runOnce(s)"
          >
            {{ s }}
          </button>
        </div>

        <div v-if="onceIsError" class="mt-4 rounded border border-error/30 bg-error/10 p-3 text-sm">
          <div><span class="text-secondary">statusCode:</span> <b>{{ onceStatus }}</b></div>
          <div><span class="text-secondary">message:</span> {{ onceMessage }}</div>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <span :class="badge(isForbidden)">isForbidden</span>
            <span :class="badge(isNotFound)">isNotFound</span>
            <span :class="badge(isValidation)">isValidation</span>
            <span :class="badge(isServerError)">isServerError</span>
          </div>
        </div>
        <p v-else class="mt-4 text-sm text-secondary">
          No error yet — click a status above.
        </p>
      </section>

      <!-- 2) Cached query -->
      <section class="rounded border border-border p-4">
        <h2 class="font-medium">
          2 · Cached query — <code class="text-brand-primary">useClientQuery</code>
        </h2>
        <p class="mt-1 text-sm text-secondary">
          The error lives in the query's reactive <code>error</code>; the global toast comes from
          the TanStack cache (<code>vue-query</code> onError). Status: 500.
        </p>

        <button
          type="button"
          class="mt-3 rounded bg-brand-primary px-4 py-2 text-sm text-white disabled:opacity-50"
          :disabled="queryFetching"
          @click="runQuery"
        >
          {{ queryFetching ? 'Fetching…' : 'Run the query (500)' }}
        </button>

        <div v-if="queryErrorInfo" class="mt-4 rounded border border-error/30 bg-error/10 p-3 text-sm">
          <div><span class="text-secondary">error.statusCode:</span> <b>{{ queryErrorInfo.statusCode }}</b></div>
          <div><span class="text-secondary">error.message:</span> {{ queryErrorInfo.message }}</div>
        </div>
        <p v-else-if="queryStarted && !queryFetching" class="mt-4 text-sm text-secondary">
          No error.
        </p>
      </section>

      <!-- 3) Mutation -->
      <section class="rounded border border-border p-4">
        <h2 class="font-medium">
          3 · Mutation — <code class="text-brand-primary">useApiMutation</code>
        </h2>
        <p class="mt-1 text-sm text-secondary">
          A POST mutation; the error is in the mutation's <code>error</code>, the mutation
          cache's <code>onError</code> notifies globally. Status: 500.
        </p>

        <button
          type="button"
          class="mt-3 rounded bg-brand-primary px-4 py-2 text-sm text-white disabled:opacity-50"
          :disabled="mutationPending"
          @click="runMutation()"
        >
          {{ mutationPending ? 'Sending…' : 'Run the mutation (500)' }}
        </button>

        <div v-if="mutationErrorInfo" class="mt-4 rounded border border-error/30 bg-error/10 p-3 text-sm">
          <div><span class="text-secondary">error.statusCode:</span> <b>{{ mutationErrorInfo.statusCode }}</b></div>
          <div><span class="text-secondary">error.message:</span> {{ mutationErrorInfo.message }}</div>
        </div>
      </section>

      <!-- 4) Form -->
      <section class="rounded border border-border p-4">
        <h2 class="font-medium">
          4 · Form — <code class="text-brand-primary">useForm</code> (server-side validation)
        </h2>
        <p class="mt-1 text-sm text-secondary">
          The fields pass client validation → the request reaches the server, which returns 422.
          useForm maps <code>[field, rule, params]</code> into <code>errors</code> unchanged (email
          fails here). No toast — validation doesn't go through the global handler.
        </p>

        <form class="mt-3 max-w-sm space-y-3" @submit.prevent="submitLogin">
          <div>
            <label class="mb-1 block text-sm">Email</label>
            <input
              v-model="loginForm.email"
              type="text"
              class="w-full rounded border border-border px-3 py-2"
              @blur="validateLoginField('email')"
            >
            <p v-if="loginErrors.email?.[0]" class="mt-1 text-sm text-error">
              {{ loginErrors.email[0] }}
            </p>
          </div>
          <div>
            <label class="mb-1 block text-sm">Password</label>
            <input
              v-model="loginForm.password"
              type="password"
              class="w-full rounded border border-border px-3 py-2"
              @blur="validateLoginField('password')"
            >
            <p v-if="loginErrors.password?.[0]" class="mt-1 text-sm text-error">
              {{ loginErrors.password[0] }}
            </p>
          </div>
          <button
            type="submit"
            class="rounded bg-brand-primary px-4 py-2 text-sm text-white disabled:opacity-50"
            :disabled="loginPending"
          >
            {{ loginPending ? 'Sending…' : 'Sign in (get a 422)' }}
          </button>
          <p v-if="loginSuccess" class="text-sm text-success">
            Success ✓
          </p>
        </form>
      </section>

      <!-- Notes -->
      <section class="rounded border border-border bg-muted/40 p-4 text-sm">
        <h2 class="font-medium">
          Special statuses
        </h2>
        <ul class="mt-2 list-disc space-y-1 pl-5 text-secondary">
          <li>
            <b>401</b> → <code>createHttp.onResponseError</code> auto-redirects to <NuxtLink to="/example-login" class="text-brand-primary">
              /example-login
            </NuxtLink> (which is why it's not among the buttons).
          </li>
          <li><b>422</b> in forms → <code>useForm</code> unpacks it into field errors; other form errors go to the global handler.</li>
          <li>Silent mode for a specific request — <code>meta: { silent: true }</code> in its options.</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

<script setup lang="ts">
import { rules } from '~/core/utils/validation'
import { setApiErrorNotifier } from '~/core/utils/handleApiError'
import type { DemoErrorResult } from '~/repositories/example/useDemoErrorRepository'

definePageMeta({
  hasCode: true, // грід 2-колонки вже на SSR (див. default.vue)
  title: 'Обробка помилок — різні типи запитів',
  subtitle: 'Єдиний пайплайн: normalizeApiError → handleGlobalApiError → notifier (toast) + локальний useApiError для гілок по статусу. Нижче — як помилка спливає у кожному типі запиту.',
  maxWidth: 'max-w-[1600px]',
  breadcrumbs: [
    { title: 'Головна', to: '/' },
    { title: 'Обробка помилок' },
  ],
})

const demo = useDemoErrorRepository()

// 401 навмисно немає серед кнопок: він тригерить авторедірект на /login
// (createHttp.onResponseError) і забрав би користувача зі сторінки.
const STATUSES = [400, 403, 404, 422, 500] as const

// ── Глобальний notifier → toasts ─────────────────────────────────────────────
// У ядрі setApiErrorNotifier ніде не викликається (лише в README). Підключаємо його
// на клієнті, щоб зробити глобальний крок видимим: усе, що доходить до
// handleGlobalApiError (useApi, TanStack cache), спливає як toast.
interface DemoToast { id: number, statusCode: number, message: string }
const toasts = ref<DemoToast[]>([])
let toastId = 0

onMounted(() => {
  setApiErrorNotifier((e) => {
    const id = ++toastId
    toasts.value = [{ id, statusCode: e.statusCode, message: e.message }, ...toasts.value]
    setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 4000)
  })
})
// Знімаємо наш notifier на виході, щоб не тримати замикання на цю сторінку.
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
    await demo.requestOnce(status) // useApi: глобальний toast + re-throw
  }
  catch (e) {
    captureOnceError(e) // локальний стан + бейджі по статусу
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
// enabled: false → запит стартує лише вручну через refetch().
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

// ── 4) Form: useForm + серверна валідація (422 → помилки полів) ───────────────
// Значення валідні для клієнта → запит доходить до сервера, який повертає 422 з
// масивом [field, rule, params]. useForm мапить його в errors без жодних змін.
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
    title: 'Пайплайн (ядро)',
    code: `// normalizeApiError: будь-що → { statusCode, message, data }
// handleGlobalApiError: normalize → log → notifier (toast).
// Викликається глобально з TanStack cache і з useApi.

// Підключення toast (зазвичай раз у плагіні):
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
    handleError(e) // локальний стан + гілки по статусу
  }
}`,
  },
  {
    title: '2 · useClientQuery / 3 · useApiMutation',
    code: `// Кешований запит: помилка в reactive error, toast — з TanStack cache
const { error, refetch } = useClientQuery({
  ...demo.statusQuery(500), enabled: false,
})

// Мутація: error у стані + onError → handleGlobalApiError (toast)
const { mutate, error } = useApiMutation({
  mutationFn: () => demo.request(500),
})`,
  },
  {
    title: '4 · useForm (422 → поля)',
    code: `// Той самий errors: клієнтські rules + серверний 422
const { form, errors, send, validateField } = useForm(
  () => demo.request(422), // сервер віддає [[field, rule, params]]
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
    <!-- Глобальні toasts — результат setApiErrorNotifier → handleGlobalApiError -->
    <div class="pointer-events-none fixed right-4 top-4 z-50 w-72 space-y-2">
      <TransitionGroup name="fade">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="rounded border border-error/30 bg-error/10 p-3 text-sm shadow-sm"
        >
          <div class="font-medium text-error">Global toast · {{ t.statusCode || '—' }}</div>
          <div class="text-secondary">{{ t.message }}</div>
        </div>
      </TransitionGroup>
    </div>

    <div class="space-y-6">
      <!-- 1) One-off -->
      <section class="rounded border border-border p-4">
        <h2 class="font-medium">
          1 · One-off — <code class="text-primary">useApi</code> + <code class="text-primary">useApiError</code>
        </h2>
        <p class="mt-1 text-sm text-secondary">
          Клік → запит з обраним статусом. useApi нотифікує глобально (toast) і кидає далі;
          useApiError нормалізує у локальний стан і дає гілки по статусу.
        </p>

        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="s in STATUSES"
            :key="s"
            type="button"
            class="rounded border border-border px-3 py-1.5 text-sm transition hover:border-primary disabled:opacity-50"
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
        <p v-else class="mt-4 text-sm text-secondary">Ще немає помилки — натисни статус вище.</p>
      </section>

      <!-- 2) Cached query -->
      <section class="rounded border border-border p-4">
        <h2 class="font-medium">2 · Cached query — <code class="text-primary">useClientQuery</code></h2>
        <p class="mt-1 text-sm text-secondary">
          Помилка живе в reactive <code>error</code> запиту; глобальний toast прилітає з
          TanStack cache (<code>vue-query</code> onError). Статус: 500.
        </p>

        <button
          type="button"
          class="mt-3 rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
          :disabled="queryFetching"
          @click="runQuery"
        >
          {{ queryFetching ? 'Fetching…' : 'Запустити запит (500)' }}
        </button>

        <div v-if="queryErrorInfo" class="mt-4 rounded border border-error/30 bg-error/10 p-3 text-sm">
          <div><span class="text-secondary">error.statusCode:</span> <b>{{ queryErrorInfo.statusCode }}</b></div>
          <div><span class="text-secondary">error.message:</span> {{ queryErrorInfo.message }}</div>
        </div>
        <p v-else-if="queryStarted && !queryFetching" class="mt-4 text-sm text-secondary">Без помилки.</p>
      </section>

      <!-- 3) Mutation -->
      <section class="rounded border border-border p-4">
        <h2 class="font-medium">3 · Mutation — <code class="text-primary">useApiMutation</code></h2>
        <p class="mt-1 text-sm text-secondary">
          POST-мутація; помилка в <code>error</code> мутації, глобально нотифікує
          <code>onError</code> кешу мутацій. Статус: 500.
        </p>

        <button
          type="button"
          class="mt-3 rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
          :disabled="mutationPending"
          @click="runMutation()"
        >
          {{ mutationPending ? 'Sending…' : 'Виконати мутацію (500)' }}
        </button>

        <div v-if="mutationErrorInfo" class="mt-4 rounded border border-error/30 bg-error/10 p-3 text-sm">
          <div><span class="text-secondary">error.statusCode:</span> <b>{{ mutationErrorInfo.statusCode }}</b></div>
          <div><span class="text-secondary">error.message:</span> {{ mutationErrorInfo.message }}</div>
        </div>
      </section>

      <!-- 4) Form -->
      <section class="rounded border border-border p-4">
        <h2 class="font-medium">4 · Form — <code class="text-primary">useForm</code> (серверна валідація)</h2>
        <p class="mt-1 text-sm text-secondary">
          Поля валідні для клієнта → запит доходить до сервера, який повертає 422. useForm мапить
          <code>[field, rule, params]</code> у <code>errors</code> без змін (тут валиться email).
          Без toast — валідація не йде в глобальний хендлер.
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
            <p v-if="loginErrors.email?.[0]" class="mt-1 text-sm text-error">{{ loginErrors.email[0] }}</p>
          </div>
          <div>
            <label class="mb-1 block text-sm">Пароль</label>
            <input
              v-model="loginForm.password"
              type="password"
              class="w-full rounded border border-border px-3 py-2"
              @blur="validateLoginField('password')"
            >
            <p v-if="loginErrors.password?.[0]" class="mt-1 text-sm text-error">{{ loginErrors.password[0] }}</p>
          </div>
          <button
            type="submit"
            class="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
            :disabled="loginPending"
          >
            {{ loginPending ? 'Надсилаю…' : 'Увійти (отримати 422)' }}
          </button>
          <p v-if="loginSuccess" class="text-sm text-success">Успішно ✓</p>
        </form>
      </section>

      <!-- Нотатки -->
      <section class="rounded border border-border bg-muted/40 p-4 text-sm">
        <h2 class="font-medium">Особливі статуси</h2>
        <ul class="mt-2 list-disc space-y-1 pl-5 text-secondary">
          <li><b>401</b> → <code>createHttp.onResponseError</code> робить авторедірект на <NuxtLink to="/example-login" class="text-primary">/example-login</NuxtLink> (тому його немає серед кнопок).</li>
          <li><b>422</b> у формах → <code>useForm</code> розкладає у помилки полів; решта помилок форми йдуть у глобальний хендлер.</li>
          <li>Тихий режим для конкретного запиту — <code>meta: { silent: true }</code> у його опціях.</li>
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

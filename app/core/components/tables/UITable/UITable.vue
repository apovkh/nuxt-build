<script setup lang="ts">
import type { VDataTable } from 'vuetify/components'
import type { GroupSlotScope } from '../ui-data-table.composable'
import type { UITableHeader } from './UITable.types'
import { mdiChevronDown, mdiChevronRight } from '@mdi/js'
import { useGrouped, useTableDimmer } from '../ui-data-table.composable'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  items?: any[]
  headers?: UITableHeader[]
  isLoading?: boolean
  noDataText?: string
  showSelect?: boolean
  showExpand?: boolean
  showPagination?: boolean
  sortBy?: Array<{ key: string, order?: string }>
  groupBy?: Array<{ key: string, order?: string }>
  hideGroupExpand?: boolean
  noHover?: boolean
  itemKey?: string
  itemSelectable?: string | ((item: any) => boolean)
  density?: 'default' | 'comfortable' | 'compact'
  searchValue?: string
  expanded?: any[]
  useClickRow?: boolean
  /** Варіанти per-page для дропдауна футера. `-1` — «Всі». */
  itemsPerPageOptions?: number[]
}>(), {
  items: () => [],
  headers: () => [],
  isLoading: false,
  noDataText: 'Немає даних',
  showSelect: false,
  showExpand: false,
  showPagination: true,
  density: 'default',
  expanded: undefined,
  noHover: false,
  hideGroupExpand: false,
  itemKey: 'id',
  itemsPerPageOptions: () => [25, 50, 100, -1],
})

// update:itemsPerPage / update:page тут не оголошуємо — їх уже декларує defineModel
// нижче, і подвійна декларація лише плодить дублікати.
const emit = defineEmits<{
  (e: 'update:expanded', value: any[]): void
  (e: 'click:row', value: { item: any, [key: string]: any }): void
}>()

defineSlots<{
  'top': any
  'item': any
  'data-table-group': any
  'bottom': any
  [key: string]: any
}>()

const itemsPerPage = defineModel<number>('itemsPerPage', {
  default: 25,
})

const page = defineModel<number>('page', {
  default: 1,
})

const selected = defineModel<any[]>('selected', {
  default: () => [],
})

const tableRef = ref<VDataTable>()

const onRowClick = (_: Event, value: any) => {
  emit('click:row', value)
}

const onExpanded = (value: any[]) => {
  emit('update:expanded', value)
}

const slots = useSlots()
const excludeSlots = ['top', 'no-data', 'bottom', 'data-table-group']

const computedSlots = computed<Record<string, any>>(() => {
  const result: Record<string, any> = {}
  Object.keys(slots).forEach((key) => {
    if (!excludeSlots.includes(key)) {
      result[key] = slots[key]
    }
  })

  // Порожній об'єкт слотів Vuetify трактує як «слотів немає» і малює дефолти,
  // тож віддаємо заглушку. Ключ навмисне не `_` — так зветься службовий прапорець
  // стабільності слотів у Vue.
  if (Object.keys(result).length === 0) {
    return { 'ui-table-noop': () => null }
  }

  return result
})

const {
  showScrollDimmer,
  tableHeaderHeight,
  tableFooterHeight,
} = useTableDimmer(tableRef)

const attrs = useAttrs()
const classes = computed(() => [
  attrs.class,
  'ui-table',
  `ui-table--density-${props.density}`,
  {
    'ui-table--grouped': props.groupBy?.length,
    'ui-table--grouped-hide-expand': props.hideGroupExpand,
    'ui-table--expanding': props.showExpand,
    'ui-table--no-hover': props.noHover,
    'ui-table--with-scroll-dimmer': showScrollDimmer.value,
  },
])

const computedAttrs = computed(() => {
  const attrsObj: Record<string, any> = { ...attrs }
  delete attrsObj.class

  if (props.expanded) {
    attrsObj.expanded = props.expanded
  }

  if (props.useClickRow) {
    attrsObj['onClick:row'] = onRowClick
  }

  return attrsObj
})

const onExpandAll = async () => {
  if (!props.expanded) {
    console.warn('no "v-model:expanded" prop')
  }

  if (props.expanded?.length) {
    emit('update:expanded', [])
  }
  else {
    emit('update:expanded', props.items.map(item => item[props.itemKey]))
  }
}

const {
  isAnyOpened,
  toggleAll,
  setScope,
} = useGrouped()

// Кнопка «розгорнути все» живе у #header.data-table-group, а цей слот бачить лише
// свій стовпчик. groupedItems/toggleGroup дає VDataTableSlotProps, який приходить
// у #top — звідси renderless-компонент, що просто передає скоуп у composable.
const GroupScopeCapture = (props: { scope: GroupSlotScope }) => {
  setScope(props.scope)

  return null
}

const { showSelect, groupBy, showExpand } = toRefs(props)
watch([showSelect, groupBy, showExpand], () => {
  if (props.groupBy && (props.showSelect || props.showExpand)) {
    console.error('Not supported "groupBy" prop with "showSelect" or "showExpand"')
  }
}, { immediate: true })
</script>

<template>
  <div
    class="ui-table-host"
    :class="{ 'ui-table-host--loading': isLoading }"
    :inert="isLoading"
    :aria-busy="isLoading ? 'true' : 'false'"
    data-id="ui-table"
  >
    <VDataTable
      ref="tableRef"
      v-model="selected"
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      :class="classes"
      :item-value="itemKey"
      :items-per-page-options="itemsPerPageOptions"
      :show-select="showSelect"
      :item-selectable="itemSelectable"
      :headers="(headers as any)"
      :items="items"
      :sort-by="(sortBy as any)"
      :group-by="(groupBy as any)"
      :show-expand="showExpand"
      :loading="isLoading"
      v-bind="computedAttrs"
      @update:expanded="onExpanded"
    >
      <template #top="topScope">
        <GroupScopeCapture :scope="topScope" />

        <div v-if="$slots.top" class="ui-table__top px-4 py-3">
          <slot name="top" />
        </div>

        <VProgressLinear
          v-if="isLoading"
          indeterminate
          height="2"
          class="absolute left-0 top-[48px] right-0"
          color="brand-primary"
          aria-label="Loading"
        />
      </template>

      <template #header.data-table-group>
        <UIBtn
          icon
          variant="text"
          color="brand-primary"
          :aria-label="isAnyOpened ? 'Collapse all' : 'Expand all'"
          @click="toggleAll"
        >
          <UIIcon :icon="isAnyOpened ? mdiChevronDown : mdiChevronRight" />
        </UIBtn>
      </template>

      <template #header.data-table-expand>
        <UIBtn
          :disabled="items.length === 0"
          icon
          color="brand-primary"
          variant="text"
          :aria-label="expanded?.length ? 'Collapse all rows' : 'Expand all rows'"
          @click="onExpandAll"
        >
          <UIIcon size="22" :icon="expanded?.length ? mdiChevronDown : mdiChevronRight" />
        </UIBtn>
      </template>

      <template
        #header.data-table-select="{
          allSelected,
          someSelected,
          selectAll,
        }"
      >
        <UICheckboxBtn
          :disabled="items.length === 0"
          :model-value="allSelected && items.length !== 0"
          :indeterminate="someSelected && !allSelected"
          aria-label="Select all rows"
          @update:model-value="selectAll($event as boolean)"
        />
      </template>

      <template #item.data-table-select="{ internalItem, isSelected, toggleSelect }">
        <UICheckboxBtn
          :model-value="isSelected(internalItem)"
          aria-label="Select row"
          @update:model-value="(value) => {
            if (value !== isSelected(internalItem))
              toggleSelect(internalItem)
          }"
        />
      </template>

      <template #group-header="{ item, isGroupOpen, toggleGroup }">
        <tr
          class="v-data-table-group-header-row"
          :style="{
            '--v-data-table-group-header-row-depth': item.depth,
          }"
        >
          <td>
            <UITableGroupOpenBtn
              :is-open="isGroupOpen(item)"
              :on-toggle="() => toggleGroup(item)"
              :hidden="hideGroupExpand"
              :group="item"
              class="ui-table__group-open-btn"
            />
          </td>
          <td colspan="20">
            <div class="flex items-center h-full">
              <slot name="data-table-group" :item="item" />
            </div>
          </td>
        </tr>
      </template>

      <template #no-data>
        <VExpandTransition>
          <UIEmptyState v-if="!isLoading" class="ui-table__no-data">
            <template v-if="searchValue">
              <span>Немає результатів для <span class="font-bold">"{{ searchValue }}"</span></span>
            </template>
            <template v-else>
              {{ noDataText }}
            </template>
          </UIEmptyState>
        </VExpandTransition>
      </template>

      <template #item.data-table-expand="{ isExpanded, toggleExpand, internalItem }">
        <UIBtn
          icon
          color="brand-primary"
          variant="text"
          :aria-label="isExpanded(internalItem) ? 'Collapse row' : 'Expand row'"
          @click="toggleExpand(internalItem)"
        >
          <UIIcon size="22" :icon="isExpanded(internalItem) ? mdiChevronDown : mdiChevronRight" />
        </UIBtn>
      </template>

      <template v-if="!showPagination || $slots.bottom" #bottom>
        <slot name="bottom" />
      </template>

      <template
        v-for="(_, slotName) in computedSlots"
        #[slotName]="slotData"
      >
        <slot :name="slotName" v-bind="slotData" />
      </template>

      <template #footer.prepend>
        <slot name="footer" />
      </template>
    </VDataTable>
  </div>
</template>

<style lang="scss">
.ui-table-host {
  @apply w-full;

  &--loading {
    @apply cursor-wait select-none;

    pointer-events: none;
  }
}

.ui-table {
  --table-header-height: v-bind(tableHeaderHeight);
  --table-footer-height: v-bind(tableFooterHeight);

  @apply text-sm relative rounded-xl overflow-hidden border border-solid border-border;

  & > .v-data-table-footer {
    padding: 16px !important;
    opacity: 0.6;
    transition: opacity 0.3s;
    border-top: 1px solid rgb(var(--v-theme-border));

    &:hover {
      opacity: 1;
    }
  }

  & > .v-table__wrapper {
    border-top: 1px solid rgb(var(--v-theme-border));

    &:first-child {
      border-top: none;
    }

    & > table {
      border-collapse: collapse;

      & > thead {
        & > tr > th {
          @apply text-secondary text-[12.5px] font-semibold;

          height: var(--v-table-header-height);
          border-bottom: 1px solid rgb(var(--v-theme-muted)) !important;
        }
      }

      & > tbody {
        & > tr {
          &:not(:last-child) > td {
            border-bottom: 1px solid rgb(var(--v-theme-muted)) !important;
          }
        }
      }
    }
  }

  & > .v-divider {
    display: none !important;
  }

  &:not(.ui-table--no-hover) {
    & > .v-table__wrapper {
      & > table {
        & > tbody {
          & > tr {
            & > td {
              transition: all 0.3s;
            }

            &:hover:not(.v-data-table-rows-no-data) > td {
              background: rgb(var(--v-theme-background)) !important;
            }
          }
        }
      }
    }
  }

  .v-data-table-group-header-row {
    td:empty {
      display: none;
    }
  }

  &__no-data {
    @apply flex flex-col items-center gap-5 p-10 text-lg font-medium;
  }

  &--density {
    &-default {
      --v-table-row-height: 48px;
      --v-table-header-height: 48px;

      .v-selection-control {
        @apply text-lg;
      }
    }

    &-comfortable {
      --v-table-row-height: 40px;
      --v-table-header-height: 42px;

      .ui-table__no-data {
        @apply text-base font-normal flex-row items-center p-7;
      }

      .v-selection-control {
        --v-selection-control-size: 32px;

        @apply text-lg;
      }
    }

    &-compact {
      --v-table-row-height: 32px;
      --v-table-header-height: 36px;

      .v-selection-control {
        --v-selection-control-size: 30px;

        @apply text-base;
      }
    }
  }
}

.ui-table {
  position: relative;

  /* Дімер справа сигналізує, що таблиця скролиться горизонтально */
  &::after {
    transition: all 0.2s;
    visibility: hidden;
    opacity: 0;
    content: '';
    position: absolute;
    right: 0;
    top: var(--table-header-height);
    bottom: var(--table-footer-height);
    width: 30px;
    pointer-events: none;
    background: linear-gradient(to right, rgb(var(--v-theme-primary) / 0), rgb(var(--v-theme-primary) / 0.16));
  }
}

.ui-table--with-scroll-dimmer {
  &::after {
    @apply visible opacity-100;
  }
}

.ui-table--grouped {
  tr:not(.v-data-table-rows-no-data) > td:first-child {
    width: 46px;
    max-width: 46px;
    padding: 0 0 0 16px !important;
  }

  tr > th:first-child {
    width: 46px;
    max-width: 46px;
    padding: 0 0 0 16px !important;
  }

  &.ui-table--density-compact {
    tr:not(.v-data-table-rows-no-data) > td:first-child {
      width: 38px;
      max-width: 38px;
      padding: 0 0 0 8px !important;
    }

    tr > th:first-child {
      width: 38px;
      max-width: 38px;
      padding: 0 0 0 8px !important;
    }
  }

  .v-data-table-group-header-row td {
    background-color: rgb(var(--v-theme-muted)) !important;
  }
}

.ui-table--grouped-hide-expand {
  tr:not(.v-data-table-rows-no-data) > td:first-child {
    display: none !important;
  }

  tr > th:first-child {
    display: none !important;
  }
}

.ui-table--expanding {
  & > .v-table__wrapper {
    & > table > tbody > .v-data-table__tr > td {
      background: rgb(var(--v-theme-surface));
    }
  }
}
</style>

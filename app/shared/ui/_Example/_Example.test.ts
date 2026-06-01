// @vitest-environment nuxt
import type { ComponentMountingOptions } from '@vue/test-utils'
import type { IExampleProps } from './_Example.types'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AExample from './_Example.vue'

const factory = (
  props: Partial<IExampleProps> = {},
  options: ComponentMountingOptions<typeof AExample> = {},
) =>
  mount(AExample, {
    props: { modelValue: '', ...props },
    ...options,
  })

const buttons = (wrapper: ReturnType<typeof factory>) => ({
  append: wrapper.findAll('button')[0]!,
  submit: wrapper.findAll('button')[1]!,
  reset: wrapper.findAll('button')[2]!,
})

describe('AExample', () => {
  describe('render structure', () => {
    it('renders root element with base class', () => {
      const wrapper = factory()
      expect(wrapper.classes()).toContain('a-example')
    })

    it('renders action buttons (Append, Submit, Reset)', () => {
      const wrapper = factory()
      const all = wrapper.findAll('button')
      expect(all).toHaveLength(3)
      const { append, submit, reset } = buttons(wrapper)
      expect(append.text()).toBe('Append')
      expect(submit.text()).toBe('Submit')
      expect(reset.text()).toBe('Reset')
    })

    it('passes through $attrs to root element', () => {
      const wrapper = factory({}, { attrs: { 'data-testid': 'example-root' } })
      expect(wrapper.attributes('data-testid')).toBe('example-root')
    })
  })

  describe('props', () => {
    it('applies variant class from the variant prop', () => {
      const wrapper = factory({ variant: 'primary' })
      expect(wrapper.classes()).toContain('a-example--primary')
    })

    it('defaults variant to "default" when not provided', () => {
      const wrapper = factory()
      expect(wrapper.classes()).toContain('a-example--default')
    })

    it('applies disabled modifier class when disabled is true', () => {
      const wrapper = factory({ disabled: true })
      expect(wrapper.classes()).toContain('a-example--disabled')
    })

    it('disables all action buttons when disabled is true', () => {
      const wrapper = factory({ disabled: true })
      wrapper.findAll('button').forEach((btn) => {
        expect(btn.attributes('disabled')).toBeDefined()
      })
    })

    it('initializes internal value from modelValue', () => {
      const wrapper = factory({ modelValue: 'hello' })
      expect(wrapper.text()).toContain('hello (default)')
    })
  })

  describe('computed', () => {
    it('formats value as "{value} ({variant})"', () => {
      const wrapper = factory({ modelValue: 'foo', variant: 'primary' })
      expect(wrapper.text()).toContain('foo (primary)')
    })

    it('updates formatted value after internal change', async () => {
      const wrapper = factory({ modelValue: 'foo' })
      await buttons(wrapper).append.trigger('click')
      expect(wrapper.text()).toContain('foo! (default)')
    })
  })

  describe('emits', () => {
    it('emits update:modelValue when Append is clicked', async () => {
      const wrapper = factory({ modelValue: 'a' })
      await buttons(wrapper).append.trigger('click')
      expect(wrapper.emitted('update:modelValue')).toEqual([['a!']])
    })

    it('emits submit with current internal value', async () => {
      const wrapper = factory({ modelValue: 'payload' })
      await buttons(wrapper).submit.trigger('click')
      expect(wrapper.emitted('submit')).toEqual([['payload']])
    })

    it('does not emit when disabled', async () => {
      const wrapper = factory({ modelValue: 'a', disabled: true })
      await buttons(wrapper).append.trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('emits update:modelValue exactly once per Append click', async () => {
      const wrapper = factory({ modelValue: 'a' })
      await buttons(wrapper).append.trigger('click')
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    })

    it('chains Append clicks, emitting each transformed value', async () => {
      const wrapper = factory({ modelValue: 'x' })
      await buttons(wrapper).append.trigger('click')
      await buttons(wrapper).append.trigger('click')
      await buttons(wrapper).append.trigger('click')
      expect(wrapper.emitted('update:modelValue')).toEqual([['x!'], ['x!!'], ['x!!!']])
    })

    it('emits submit each time the Submit button is clicked', async () => {
      const wrapper = factory({ modelValue: 'p' })
      await buttons(wrapper).submit.trigger('click')
      await buttons(wrapper).submit.trigger('click')
      expect(wrapper.emitted('submit')).toEqual([['p'], ['p']])
    })
  })

  describe('v-model', () => {
    it('syncs internal value when modelValue prop changes externally', async () => {
      const wrapper = factory({ modelValue: 'one' })
      await wrapper.setProps({ modelValue: 'two' })
      await nextTick()
      expect(wrapper.text()).toContain('two (default)')
    })

    it('reset emits empty string via update:modelValue', async () => {
      const wrapper = factory({ modelValue: 'something' })
      await buttons(wrapper).reset.trigger('click')
      expect(wrapper.emitted('update:modelValue')).toEqual([['']])
    })
  })

  describe('methods (defineExpose)', () => {
    const exposed = (wrapper: ReturnType<typeof factory>) =>
      wrapper.vm as unknown as { reset: () => void, focus: () => void }

    it('exposes reset() that clears the value and emits', async () => {
      const wrapper = factory({ modelValue: 'x' })
      exposed(wrapper).reset()
      await nextTick()
      expect(wrapper.emitted('update:modelValue')).toEqual([['']])
    })

    it('reset() is a no-op when disabled (covers update early return)', async () => {
      const wrapper = factory({ modelValue: 'x', disabled: true })
      exposed(wrapper).reset()
      await nextTick()
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      expect(wrapper.text()).toContain('x (default)')
    })

    it('exposes focus() callable without error', () => {
      const wrapper = factory()
      expect(() => exposed(wrapper).focus()).not.toThrow()
    })

    it('focus() calls focus on the root element', () => {
      const wrapper = factory({}, { attachTo: document.body })
      const spy = vi.spyOn(wrapper.element as HTMLElement, 'focus')
      exposed(wrapper).focus()
      expect(spy).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })
  })

  describe('slots', () => {
    it('renders default slot content with scoped value', () => {
      const wrapper = factory(
        { modelValue: 'scoped' },
        { slots: { default: '<span class="slot-default">{{ params.value }}</span>' } },
      )
      expect(wrapper.find('.slot-default').exists()).toBe(true)
    })

    it('falls back to formatted value when default slot is empty', () => {
      const wrapper = factory({ modelValue: 'fallback' })
      expect(wrapper.text()).toContain('fallback (default)')
    })

    it('renders prepend slot', () => {
      const wrapper = factory({}, { slots: { prepend: '<span class="prepend">PRE</span>' } })
      expect(wrapper.find('.prepend').exists()).toBe(true)
    })

    it('renders append slot', () => {
      const wrapper = factory({}, { slots: { append: '<span class="append">POST</span>' } })
      expect(wrapper.find('.append').exists()).toBe(true)
    })
  })

  describe('watch', () => {
    it('does not re-emit when prop is set to the same internal value', async () => {
      const wrapper = factory({ modelValue: 'same' })
      await wrapper.setProps({ modelValue: 'same' })
      await nextTick()
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('skips internal reassignment when prop matches mutated internal value', async () => {
      const wrapper = factory({ modelValue: 'x' })
      await buttons(wrapper).append.trigger('click')
      expect(wrapper.text()).toContain('x! (default)')

      await wrapper.setProps({ modelValue: 'x!' })
      await nextTick()
      expect(wrapper.text()).toContain('x! (default)')
      expect(wrapper.emitted('update:modelValue')).toEqual([['x!']])
    })

    it('reflects external modelValue updates in rendered output', async () => {
      const wrapper = factory({ modelValue: 'a' })
      await wrapper.setProps({ modelValue: 'b' })
      await nextTick()
      expect(wrapper.text()).toContain('b (default)')
    })

    it('updates computed output when variant prop changes', async () => {
      const wrapper = factory({ modelValue: 'v', variant: 'default' })
      await wrapper.setProps({ variant: 'primary' })
      await nextTick()
      expect(wrapper.text()).toContain('v (primary)')
      expect(wrapper.classes()).toContain('a-example--primary')
      expect(wrapper.classes()).not.toContain('a-example--default')
    })

    it('toggles disabled class when prop changes at runtime', async () => {
      const wrapper = factory({ disabled: false })
      expect(wrapper.classes()).not.toContain('a-example--disabled')
      await wrapper.setProps({ disabled: true })
      expect(wrapper.classes()).toContain('a-example--disabled')
    })
  })
})

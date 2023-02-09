import { describe, expect, it } from 'vitest'

import { mount } from '@vue/test-utils'

import Example from './Example.vue'

describe('Example test', () => {
	it('Example pass prop text', () => {
		const wrapper = mount(Example, {
			props: {
				text: 'text'
			}
		})

		expect(wrapper.vm.text).toBe('text')
	})
})

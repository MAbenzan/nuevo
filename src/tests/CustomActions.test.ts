import { test, expect } from '@playwright/test'
import { CustomActions } from 'actions/customActions'

test.describe('CustomActions', () => {
  test('customClick y customType integran waiters', async ({ page }, testInfo) => {
    const actions = new CustomActions(page, testInfo)
    await page.setContent('<button id="btn">Click</button><input id="inp"/>')
    const btn = page.locator('#btn')
    const inp = page.locator('#inp')
    await actions.click(btn, 'click-boton')
    await actions.type(inp, 'hola', 'type-input')
    await expect(inp).toHaveValue('hola')
  })

  test('customClick lanza error si no visible', async ({ page }, testInfo) => {
    const actions = new CustomActions(page, testInfo)
    await page.setContent('<button id="btn" style="display:none">Click</button>')
    const btn = page.locator('#btn')
    await expect(actions.click(btn, 'click-invisible')).rejects.toThrow('Elemento no visible antes de la acción')
  })
})

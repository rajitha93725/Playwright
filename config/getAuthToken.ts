import { Page, chromium } from "@playwright/test"

export default async function getAuthToken() {
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] })
    const contextAuthorized = await browser.newContext()
    const pageAuthorized = await contextAuthorized.newPage()

    process.env.TOKEN = await login(pageAuthorized, process.env.USERNAME, process.env.PASSWORD);
    console.info("TOKEN: "+process.env.TOKEN);
}

async function login(page: Page, username: string, password: string): Promise<string> {
    await page.goto(process.env.BASEURL, { timeout: 600000 })
    await page.getByPlaceholder('Username').fill(username)
    await page.getByPlaceholder('Password').fill(password)
    await page.getByPlaceholder('Company code').fill('ditst')
    await page.locator('.checkbox-check').click()
    const [response] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/token')),
      await page.getByRole('button', { name: 'Sign in' }).click(),
    ])
    const responseBody = await response.json()
    return await responseBody.access_token
  }
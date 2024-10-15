import { getEnv } from '../playwright.config'
import getAuthToken from './getAuthToken'

async function globalSetup() {
    getEnv()
    await getAuthToken()
}
export default globalSetup
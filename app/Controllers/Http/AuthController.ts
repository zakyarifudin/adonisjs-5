import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'
import Database from '@ioc:Adonis/Lucid/Database'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class AuthController {
  async login({ request, response, auth }: HttpContextContract) {
    // Validasi
    const loginValidate = schema.create({
      username: schema.string(),
      password: schema.string(),
    })

    await request.validate({ schema: loginValidate })

    const username = request.input('username')
    const password = request.input('password')

    // Lookup user manually
    const user = await Database.from('users')
      .select('id_user', 'username', 'password')
      .where('username', username)
      .where('is_active', 1)
      .firstOrFail()

    // Verify password
    if (!(await Hash.verify(user.password, password))) {
      return response.badRequest({
        status: 'error',
        message: 'Invalid credentials',
      })
    }

    // Generate token
    const token = await auth.use('api').attempt(username, password)
    return token
  }
}

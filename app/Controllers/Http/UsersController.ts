import Hash from '@ioc:Adonis/Core/Hash'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { v4 as uuid } from 'uuid'

export default class UsersController {
  public async getAll({ response }: HttpContextContract) {
    const users = await Database.from('users').select('id_user', 'username', 'is_active')

    return response.json(users)
  }

  public async getOne({ response, params }: HttpContextContract) {
    const user = await Database.from('users')
      .select('id_user', 'username', 'is_active')
      .where({ id_user: params.id })
      .first()

    return response.json(user)
  }

  public async add({ response, request }: HttpContextContract) {
    // Validasi
    const newUser = schema.create({
      username: schema.string({ trim: true }, [
        rules.unique({ table: 'users', column: 'username' }),
      ]),
      password: schema.string(),
    })

    await request.validate({ schema: newUser })

    const user = {
      id_user: uuid(),
      username: request.input('username'),
      password: await Hash.make(request.input('password')),
      is_active: 1,
      is_login: 0,
      language: 'ID',
    }

    try {
      await Database.insertQuery().table('users').insert(user)
      return response.json({
        message: 'add user',
        user: user,
      })
    } catch (error) {
      return response.json({
        message: 'error',
        error: error,
      })
    }
  }
}

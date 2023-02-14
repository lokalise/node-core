import type { Interceptable } from 'undici'
import { Client, MockAgent, setGlobalDispatcher } from 'undici'

import {
  buildClient,
  sendDelete,
  sendGet,
  sendPatch,
  sendPost,
  sendPut,
  sendPutBinary,
} from './httpClient'
import mockProduct1 from './mock-data/mockProduct1.json'
import mockProductsLimit3 from './mock-data/mockProductsLimit3.json'

const JSON_HEADERS = {
  'content-type': 'application/json',
}

const TEXT_HEADERS = {
  'content-type': 'text/plain',
}

const baseUrl = 'https://fakestoreapi.com'

describe('httpClient', () => {
  let mockAgent: MockAgent
  let client: Client & Interceptable
  beforeEach(() => {
    mockAgent = new MockAgent()
    mockAgent.disableNetConnect()
    setGlobalDispatcher(mockAgent)
    client = mockAgent.get(baseUrl) as unknown as Client & Interceptable
  })

  describe('buildClient', () => {
    it('creates a client', () => {
      const client = buildClient(baseUrl)
      expect(client).toBeInstanceOf(Client)
    })
  })

  describe('GET', () => {
    it('returns original payload when breaking during parsing', async () => {
      expect.assertions(1)
      client
        .intercept({
          path: '/products/1',
          method: 'GET',
        })
        .reply(200, 'this is not a real json', { headers: JSON_HEADERS })

      try {
        await sendGet(client, '/products/1', { safeParseJson: true })
      } catch (err) {
        // This is needed, because built-in error assertions do not assert nested fields
        // eslint-disable-next-line jest/no-conditional-expect
        expect(err).toMatchObject({
          message: 'Error while parsing HTTP JSON response',
          errorCode: 'INVALID_HTTP_RESPONSE_JSON',
          details: {
            rawBody: 'this is not a real json',
          },
        })
      }
    })

    it('GET without queryParams', async () => {
      client
        .intercept({
          path: '/products/1',
          method: 'GET',
        })
        .reply(200, mockProduct1, { headers: JSON_HEADERS })

      const result = await sendGet(client, '/products/1')

      expect(result.result.body).toEqual(mockProduct1)
    })

    it('GET returning text', async () => {
      client
        .intercept({
          path: '/products/1',
          method: 'GET',
        })
        .reply(200, 'just text', {
          headers: TEXT_HEADERS,
        })

      const result = await sendGet(client, '/products/1')

      expect(result.result.body).toBe('just text')
    })

    it('GET returning text without content type', async () => {
      client
        .intercept({
          path: '/products/1',
          method: 'GET',
        })
        .reply(200, 'just text', {})

      const result = await sendGet<string>(client, '/products/1')

      expect(result.result.body).toBe('just text')
    })

    it('GET with queryParams', async () => {
      const query = {
        limit: 3,
      }

      client
        .intercept({
          path: '/products',
          method: 'GET',
          query,
        })
        .reply(200, mockProductsLimit3, { headers: JSON_HEADERS })

      const result = await sendGet(client, '/products', {
        query,
      })

      expect(result.result.body).toEqual(mockProductsLimit3)
    })

    it('Throws an error on internal error', async () => {
      expect.assertions(1)
      const query = {
        limit: 3,
      }

      client
        .intercept({
          path: '/products',
          method: 'GET',
          query,
        })
        .replyWithError(new Error('connection error'))

      await expect(
        sendGet(client, '/products', {
          query,
        }),
      ).rejects.toMatchObject({
        message: 'connection error',
      })
    })

    it('Returns error response', async () => {
      expect.assertions(1)
      const query = {
        limit: 3,
      }

      client
        .intercept({
          path: '/products',
          method: 'GET',
          query,
        })
        .reply(400, 'Invalid request')

      await expect(
        sendGet(client, '/products', {
          query,
        }),
      ).rejects.toMatchObject({
        message: 'Response status code 400',
        details: {
          response: {
            body: 'Invalid request',
            statusCode: 400,
          },
        },
      })
    })

    it('Works with retry', async () => {
      expect.assertions(1)
      const query = {
        limit: 3,
      }

      client
        .intercept({
          path: '/products',
          method: 'GET',
          query,
        })
        .reply(500, 'Invalid request')
      client
        .intercept({
          path: '/products',
          method: 'GET',
          query,
        })
        .reply(200, 'OK')

      const response = await sendGet(client, '/products', {
        query,
        retryConfig: {
          statusCodesToRetry: [500],
          retryOnTimeout: false,
          delayBetweenAttemptsInMsecs: 0,
          maxAttempts: 2,
        },
      })

      expect(response.result.body).toBe('OK')
    })
  })

  describe('DELETE', () => {
    it('DELETE without queryParams', async () => {
      client
        .intercept({
          path: '/products/1',
          method: 'DELETE',
        })
        .reply(204, undefined, { headers: TEXT_HEADERS })

      const result = await sendDelete(client, '/products/1')

      expect(result.result.statusCode).toBe(204)
      expect(result.result.body).toBe('')
    })

    it('DELETE with queryParams', async () => {
      const query = {
        limit: 3,
      }

      client
        .intercept({
          path: '/products',
          method: 'DELETE',
          query,
        })
        .reply(204, undefined, { headers: TEXT_HEADERS })

      const result = await sendDelete(client, '/products', {
        query,
      })

      expect(result.result.statusCode).toBe(204)
      expect(result.result.body).toBe('')
    })

    it('Throws an error on internal error', async () => {
      expect.assertions(1)
      const query = {
        limit: 3,
      }

      client
        .intercept({
          path: '/products',
          method: 'DELETE',
          query,
        })
        .replyWithError(new Error('connection error'))

      await expect(
        sendDelete(client, '/products', {
          query,
        }),
      ).rejects.toMatchObject({
        message: 'connection error',
      })
    })
  })

  describe('POST', () => {
    it('POST without queryParams', async () => {
      client
        .intercept({
          path: '/products',
          method: 'POST',
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPost(client, '/products', mockProduct1)

      expect(result.result.body).toEqual({ id: 21 })
    })

    it('POST without body', async () => {
      client
        .intercept({
          path: '/products',
          method: 'POST',
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPost(client, '/products', undefined)

      expect(result.result.body).toEqual({ id: 21 })
    })

    it('POST with queryParams', async () => {
      const query = {
        limit: 3,
      }

      client
        .intercept({
          path: '/products',
          method: 'POST',
          query,
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPost(client, '/products', mockProduct1, {
        query,
      })

      expect(result.result.body).toEqual({ id: 21 })
    })

    it('POST that returns 400 throws an error', async () => {
      client
        .intercept({
          path: '/products',
          method: 'POST',
        })
        .reply(400, { errorCode: 'err' }, { headers: JSON_HEADERS })

      await expect(sendPost(client, '/products', mockProduct1)).rejects.toThrow(
        'Response status code 400',
      )
    })

    it('Throws an error on internal error', async () => {
      expect.assertions(1)
      const query = {
        limit: 3,
      }

      client
        .intercept({
          path: '/products',
          method: 'POST',
          query,
        })
        .replyWithError(new Error('connection error'))

      await expect(
        sendPost(client, '/products', undefined, {
          query,
        }),
      ).rejects.toMatchObject({
        message: 'connection error',
      })
    })
  })

  describe('PUT', () => {
    it('PUT without queryParams', async () => {
      client
        .intercept({
          path: '/products/1',
          method: 'PUT',
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPut(client, '/products/1', mockProduct1)

      expect(result.result.body).toEqual({ id: 21 })
    })

    it('PUT without body', async () => {
      client
        .intercept({
          path: '/products/1',
          method: 'PUT',
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPut(client, '/products/1', undefined)

      expect(result.result.body).toEqual({ id: 21 })
    })

    it('PUT with queryParams', async () => {
      const query = {
        limit: 3,
      }

      client
        .intercept({
          path: '/products/1',
          method: 'PUT',
          query,
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPut(client, '/products/1', mockProduct1, {
        query,
      })

      expect(result.result.body).toEqual({ id: 21 })
    })

    it('PUT that returns 400 throws an error', async () => {
      client
        .intercept({
          path: '/products/1',
          method: 'PUT',
        })
        .reply(400, { errorCode: 'err' }, { headers: JSON_HEADERS })

      await expect(sendPut(client, '/products/1', mockProduct1)).rejects.toThrow(
        'Response status code 400',
      )
    })

    it('Throws an error on internal error', async () => {
      expect.assertions(1)
      const query = {
        limit: 3,
      }

      client
        .intercept({
          path: '/products',
          method: 'PUT',
          query,
        })
        .replyWithError(new Error('connection error'))

      await expect(
        sendPut(client, '/products', undefined, {
          query,
        }),
      ).rejects.toMatchObject({
        message: 'connection error',
      })
    })
  })

  describe('PUT binary', () => {
    it('PUT without queryParams', async () => {
      client
        .intercept({
          path: '/products/1',
          method: 'PUT',
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPutBinary(client, '/products/1', Buffer.from('text'))

      expect(result.result.body).toEqual({ id: 21 })
    })

    it('PUT with queryParams', async () => {
      const query = {
        limit: 3,
      }

      client
        .intercept({
          path: '/products/1',
          method: 'PUT',
          query,
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPutBinary(client, '/products/1', Buffer.from('text'), {
        query,
      })

      expect(result.result.body).toEqual({ id: 21 })
    })

    it('PUT that returns 400 throws an error', async () => {
      client
        .intercept({
          path: '/products/1',
          method: 'PUT',
        })
        .reply(400, { errorCode: 'err' }, { headers: JSON_HEADERS })

      await expect(sendPutBinary(client, '/products/1', Buffer.from('text'))).rejects.toThrow(
        'Response status code 400',
      )
    })

    it('Throws an error on internal error', async () => {
      expect.assertions(1)
      const query = {
        limit: 3,
      }

      client
        .intercept({
          path: '/products',
          method: 'PUT',
          query,
        })
        .replyWithError(new Error('connection error'))

      await expect(
        sendPutBinary(client, '/products', null, {
          query,
        }),
      ).rejects.toMatchObject({
        message: 'connection error',
      })
    })
  })

  describe('PATCH', () => {
    it('PATCH without queryParams', async () => {
      client
        .intercept({
          path: '/products/1',
          method: 'PATCH',
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPatch(client, '/products/1', mockProduct1)

      expect(result.result.body).toEqual({ id: 21 })
    })

    it('PATCH without body', async () => {
      client
        .intercept({
          path: '/products/1',
          method: 'PATCH',
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPatch(client, '/products/1', undefined)

      expect(result.result.body).toEqual({ id: 21 })
    })

    it('PATCH with queryParams', async () => {
      const query = {
        limit: 3,
      }

      client
        .intercept({
          path: '/products/1',
          method: 'PATCH',
          query,
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPatch(client, '/products/1', mockProduct1, {
        query,
      })

      expect(result.result.body).toEqual({ id: 21 })
    })

    it('PATCH that returns 400 throws an error', async () => {
      client
        .intercept({
          path: '/products/1',
          method: 'PATCH',
        })
        .reply(400, { errorCode: 'err' }, { headers: JSON_HEADERS })

      await expect(sendPatch(client, '/products/1', mockProduct1)).rejects.toThrow(
        'Response status code 400',
      )
    })

    it('Throws an error on internal error', async () => {
      expect.assertions(1)
      const query = {
        limit: 3,
      }

      client
        .intercept({
          path: '/products',
          method: 'PATCH',
          query,
        })
        .replyWithError(new Error('connection error'))

      await expect(
        sendPatch(client, '/products', undefined, {
          query,
        }),
      ).rejects.toMatchObject({
        message: 'connection error',
      })
    })
  })
})

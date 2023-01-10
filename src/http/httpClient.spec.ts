import { MockAgent, setGlobalDispatcher } from 'undici'

import { sendDelete, sendGet, sendPatch, sendPost, sendPut, sendPutBinary } from './httpClient'
import mockProduct1 from './mock-data/mockProduct1.json'
import mockProductsLimit3 from './mock-data/mockProductsLimit3.json'

const JSON_HEADERS = {
  'content-type': 'application/json',
}

const TEXT_HEADERS = {
  'content-type': 'text/plain',
}

describe('httpClient', () => {
  let mockAgent: MockAgent
  beforeEach(() => {
    mockAgent = new MockAgent()
    mockAgent.disableNetConnect()
    setGlobalDispatcher(mockAgent)
  })

  describe('GET', () => {
    it('returns original payload when breaking during parsing', async () => {
      expect.assertions(1)
      const client = mockAgent.get('https://fakestoreapi.com')
      client
        .intercept({
          path: '/products/1',
          method: 'GET',
        })
        .reply(200, 'this is not a real json', { headers: JSON_HEADERS })

      try {
        await sendGet('https://fakestoreapi.com', 'products/1', { safeParseJson: true })
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
      const client = mockAgent.get('https://fakestoreapi.com')
      client
        .intercept({
          path: '/products/1',
          method: 'GET',
        })
        .reply(200, mockProduct1, { headers: JSON_HEADERS })

      const result = await sendGet('https://fakestoreapi.com', 'products/1')

      expect(result.body).toEqual(mockProduct1)
    })

    it('GET returning text', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
      client
        .intercept({
          path: '/products/1',
          method: 'GET',
        })
        .reply(200, 'just text', {
          headers: TEXT_HEADERS,
        })

      const result = await sendGet('https://fakestoreapi.com', 'products/1')

      expect(result.body).toBe('just text')
    })

    it('GET returning text without content type', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
      client
        .intercept({
          path: '/products/1',
          method: 'GET',
        })
        .reply(200, 'just text', {})

      const result = await sendGet('https://fakestoreapi.com', 'products/1')

      expect(result.body).toBe('just text')
    })

    it('GET with queryParams', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
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

      const result = await sendGet('https://fakestoreapi.com', 'products', {
        query,
      })

      expect(result.body).toEqual(mockProductsLimit3)
    })
  })

  describe('DELETE', () => {
    it('DELETE without queryParams', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
      client
        .intercept({
          path: '/products/1',
          method: 'DELETE',
        })
        .reply(204, undefined, { headers: TEXT_HEADERS })

      const result = await sendDelete('https://fakestoreapi.com', 'products/1')

      expect(result.statusCode).toBe(204)
      expect(result.body).toBe('')
    })

    it('DELETE with queryParams', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')

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

      const result = await sendDelete('https://fakestoreapi.com', 'products', {
        query,
      })

      expect(result.statusCode).toBe(204)
      expect(result.body).toBe('')
    })
  })

  describe('POST', () => {
    it('POST without queryParams', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
      client
        .intercept({
          path: '/products',
          method: 'POST',
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPost('https://fakestoreapi.com', 'products', mockProduct1)

      expect(result.body).toEqual({ id: 21 })
    })

    it('POST without body', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
      client
        .intercept({
          path: '/products',
          method: 'POST',
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPost('https://fakestoreapi.com', 'products', undefined)

      expect(result.body).toEqual({ id: 21 })
    })

    it('POST with queryParams', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
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

      const result = await sendPost('https://fakestoreapi.com', 'products', mockProduct1, {
        query,
      })

      expect(result.body).toEqual({ id: 21 })
    })

    it('POST that returns 400 throws an error', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
      client
        .intercept({
          path: '/products',
          method: 'POST',
        })
        .reply(400, { errorCode: 'err' }, { headers: JSON_HEADERS })

      await expect(sendPost('https://fakestoreapi.com', 'products', mockProduct1)).rejects.toThrow(
        'Response status code 400: Bad Request',
      )
    })
  })

  describe('PUT', () => {
    it('PUT without queryParams', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
      client
        .intercept({
          path: '/products/1',
          method: 'PUT',
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPut('https://fakestoreapi.com', 'products/1', mockProduct1)

      expect(result.body).toEqual({ id: 21 })
    })

    it('PUT without body', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
      client
        .intercept({
          path: '/products/1',
          method: 'PUT',
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPut('https://fakestoreapi.com', 'products/1', undefined)

      expect(result.body).toEqual({ id: 21 })
    })

    it('PUT with queryParams', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
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

      const result = await sendPut('https://fakestoreapi.com', 'products/1', mockProduct1, {
        query,
      })

      expect(result.body).toEqual({ id: 21 })
    })

    it('PUT that returns 400 throws an error', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
      client
        .intercept({
          path: '/products/1',
          method: 'PUT',
        })
        .reply(400, { errorCode: 'err' }, { headers: JSON_HEADERS })

      await expect(sendPut('https://fakestoreapi.com', 'products/1', mockProduct1)).rejects.toThrow(
        'Response status code 400: Bad Request',
      )
    })
  })

  describe('PUT binary', () => {
    it('PUT without queryParams', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
      client
        .intercept({
          path: '/products/1',
          method: 'PUT',
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPutBinary(
        'https://fakestoreapi.com',
        'products/1',
        Buffer.from('text'),
      )

      expect(result.body).toEqual({ id: 21 })
    })

    it('PUT with queryParams', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
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

      const result = await sendPutBinary(
        'https://fakestoreapi.com',
        'products/1',
        Buffer.from('text'),
        {
          query,
        },
      )

      expect(result.body).toEqual({ id: 21 })
    })

    it('PUT that returns 400 throws an error', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
      client
        .intercept({
          path: '/products/1',
          method: 'PUT',
        })
        .reply(400, { errorCode: 'err' }, { headers: JSON_HEADERS })

      await expect(
        sendPutBinary('https://fakestoreapi.com', 'products/1', Buffer.from('text')),
      ).rejects.toThrow('Response status code 400: Bad Request')
    })
  })

  describe('PATCH', () => {
    it('PATCH without queryParams', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
      client
        .intercept({
          path: '/products/1',
          method: 'PATCH',
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPatch('https://fakestoreapi.com', 'products/1', mockProduct1)

      expect(result.body).toEqual({ id: 21 })
    })

    it('PATCH without body', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
      client
        .intercept({
          path: '/products/1',
          method: 'PATCH',
        })
        .reply(200, { id: 21 }, { headers: JSON_HEADERS })

      const result = await sendPatch('https://fakestoreapi.com', 'products/1', undefined)

      expect(result.body).toEqual({ id: 21 })
    })

    it('PATCH with queryParams', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
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

      const result = await sendPatch('https://fakestoreapi.com', 'products/1', mockProduct1, {
        query,
      })

      expect(result.body).toEqual({ id: 21 })
    })

    it('PATCH that returns 400 throws an error', async () => {
      const client = mockAgent.get('https://fakestoreapi.com')
      client
        .intercept({
          path: '/products/1',
          method: 'PATCH',
        })
        .reply(400, { errorCode: 'err' }, { headers: JSON_HEADERS })

      await expect(
        sendPatch('https://fakestoreapi.com', 'products/1', mockProduct1),
      ).rejects.toThrow('Response status code 400: Bad Request')
    })
  })
})

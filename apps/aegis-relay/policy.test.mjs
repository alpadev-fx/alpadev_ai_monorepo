import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { allowed } from './policy.mjs'
test('only explicit methods and routes are allowed', () => {
  assert(allowed('GET','/api/v1/health'))
  assert(allowed('GET','/cam/camera-1/frame.jpg?wait=1'))
  assert(allowed('POST','/vision/identify'))
  for (const [method,path] of [['GET','//evil/'],['GET','/cam/%2e%2e/admin'],['POST','/api/v1/ota'],['POST','/api/v1/system/factory-reset'],['GET','/etc/passwd'],['PUT','/cam/sources']]) assert(!allowed(method,path), `${method} ${path}`)
})

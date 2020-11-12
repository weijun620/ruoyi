import request from '@/utils/request'

export function getItem(key) {
  return request({
    url: '/system/dict/data/type/'+key,
    method: 'get'
  })
}
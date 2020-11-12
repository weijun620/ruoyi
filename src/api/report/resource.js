import request from '@/utils/request'

// 查询报告列表
export function listTwo(query) {
  return request({
    url: '/report/editor/listTwo',
    method: 'get',
    params: query
  })
}

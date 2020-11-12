import request from '@/utils/request'

// 查询影像列表
export function listImage(query) {
  return request({
    url: '/image/image/list',
    method: 'get',
    params: query
  })
}

// 查询影像详细
export function getImage(id) {
  return request({
    url: '/image/image/' + id,
    method: 'get'
  })
}

// 新增影像
export function addImage(data) {
  return request({
    url: '/image/image',
    method: 'post',
    data: data
  })
}

// 修改影像
export function updateImage(data) {
  return request({
    url: '/image/image',
    method: 'put',
    data: data
  })
}

// 删除影像
export function delImage(id) {
  return request({
    url: '/image/image/' + id,
    method: 'delete'
  })
}

// 导出影像
export function exportImage(query) {
  return request({
    url: '/image/image/export',
    method: 'get',
    params: query
  })
}
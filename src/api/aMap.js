import request from '@/utils/request'
export function massif(path) {
	let url="/njq/massif/list";
	if(path){
		url+="?pointFilter="+path;
	}
	return request({
	  url: url,
	  method: 'get'
	})
}
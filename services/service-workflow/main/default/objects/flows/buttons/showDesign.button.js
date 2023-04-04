/*
 * @Author: 李海龙 220 lihailong@steedos.com
 * @Date: 2023-03-13 06:22:57
 * @LastEditors: 李海龙 lihailong@steedos.com
 * @LastEditTime: 2023-04-04 10:56:30
 */
module.exports = {
    showDesign: function (object_name, record_id) {
        //这里/api/amisFormDesign?PagId 改为 id
        document.location = Steedos.absoluteUrl(`/api/amisFormDesign?id=${record_id}`);
    },
    showDesignVisible: function (object_name, record_id, record_permissions) {

		// 控制新表单设计器按钮的显隐 若新建流程时选择启用amis新设计器 则显示新按钮 反之隐藏
        const record = Creator.getObjectRecord(object_name, record_id);
		console.log('record================================================================================================');
		console.log('record.enable_amisform :',record.enable_amisform);
        return record.enable_amisform;
    }
}

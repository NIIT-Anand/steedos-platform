

/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2022-12-12 13:42:25
 * @LastEditors: baozhoutao@steedos.com
 * @LastEditTime: 2024-02-23 14:49:10
 * @Description: 
 */
module.exports = {
    standard_newVisible: function (object_name, record_id, record_permissions, data) {
        if(Meteor.settings.public.enable_saas){
            return false;
        }
        return Creator.baseObject.actions.standard_new.visible.apply(this, arguments);
    },
}
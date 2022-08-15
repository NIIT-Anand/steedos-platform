module.exports = {
  listenTo: 'object_layouts',

  customize: function (object_name, record_id, fields) {
    let doc = Creator.odata.get(object_name, record_id);
    var newRecord = _.pick(doc, Creator.getObjectFieldsName(object_name));
    delete newRecord.is_system;
    delete newRecord._id;
    newRecord.from_code_id = record_id;
    Creator.odata.insert(object_name, newRecord, function(result, error){
        if(result){
            FlowRouter.go(`/app/-/${object_name}/view/${result._id}`)
        }
    });
  },
  customizeVisible: function(object_name, record_id, record_permissions, record){
      return Creator.baseObject.actions.standard_new.visible() && record.is_system;
  },
  standard_new: function (object_name, record_id, fields){
		var object = Creator.getObject(object_name);
    var gridName = this.action.gridName;
    // var isRelated = this.action.isRelated;
    var relatedFieldName = this.action.relatedFieldName;
    var masterRecordId = this.action.masterRecordId;
    var initialValues = this.action.initialValues
    if(!initialValues){
      initialValues = {};
      initialValues[relatedFieldName] = masterRecordId
    }
    const appId = Session.get("app_id");
    const page = Steedos.Page.getPage('form', appId, object_name);
    const title = t('New') + ' ' + object.label;
    const options = {
      gridName: gridName
    };
    const props = {
      width: "unset",
      style: {
        top: "50px",
        bottom: "50px",
        left: "50px",
        right: "50px",
        padding: "0px",
        margin: "0px",
        width: "unset"
      }, 
      className: "absolute"
    };
    Steedos.Page.render(SteedosUI.Modal, page, Object.assign({}, options, {
      appId: appId,
      objectName: object_name,
      title: title,
      data: initialValues,
    }), {
      props: props
    });
  }
}
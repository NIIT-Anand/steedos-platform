/*
 * @Author: sunhaolin@hotoa.com
 * @Date: 2022-11-16 14:57:50
 * @LastEditors: sunhaolin@hotoa.com
 * @LastEditTime: 2022-11-17 13:16:31
 * @Description: 执行出站消息
 */

import { getObject } from '../index';

import { WorkflowOutboundMessage } from './types/workflow_outbound_message';

import _ = require('underscore');

import fetch from 'node-fetch';


/**
 * 
 * @param ids workflow_outbound_messages_actions'id
 * @param recordId object record id
 * @param userSession 
 */
export async function runWorkflowOutboundMessageActions(ids: Array<string>, recordId: any, userSession: any) {
    if (_.isEmpty(ids) || _.isEmpty(recordId)) {
        return;
    }
    let filters = [['name', 'in', ids], 'or', ['_id', 'in', ids]];
    let docs = await getObject("workflow_outbound_messages").find({ filters: filters })
    for (const doc of docs) {
        await runWorkflowOutboundMessageAction(doc, recordId, userSession);
    }
    return;
}

/**
 * 
 * @param workflowOutboundMessage
 * @param recordId 
 * @param userSession 
 */
export async function runWorkflowOutboundMessageAction(workflowOutboundMessage: WorkflowOutboundMessage, recordId: any, userSession: any) {
    if (_.isEmpty(workflowOutboundMessage) || _.isEmpty(recordId)) {
        return;
    }
    const {
        object_name,
        endpoint_url,
        // user_to_send_as,
        object_fields_to_send
    } = workflowOutboundMessage;

    let record = await getObject(object_name).findOne(recordId, { fields: object_fields_to_send });

    const payload = {
        'object_name': object_name,
        'doc': record,
    }

    await fetch(endpoint_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })


}
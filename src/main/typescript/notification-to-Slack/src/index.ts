import { WebClient } from '@slack/web-api';

exports.handler = async(event: any) => {
  const message = JSON.parse(JSON.parse(JSON.stringify(event.Records[0].Sns.Message)))

  const web = new WebClient(process.env.SLACK_API_TOKEN);

  const params: any = {
    channel: process.env.SLACK_CHANNEL!,
    blocks:  [
      {
        "type": "section",
        "fields": [
          {
            "type": "mrkdwn",
            "text": "*Repository Name:*"
          },
          {
            "type": "mrkdwn",
            "text": message['detail']['repository-name']
          },
          {
            "type": "mrkdwn",
            "text": "*Time*:"
          },
          {
            "type": "mrkdwn",
            "text": message['time']
          },
          {
            "type": "mrkdwn",
            "text": "*Action Type:*"
          },
          {
            "type": "mrkdwn",
            "text": message['detail']['action-type']
          },
          {
            "type": "mrkdwn",
            "text": "*Result:*"
          },
          {
            "type": "mrkdwn",
            "text": message['detail']['result']
          },
          {
            "type": "mrkdwn",
            "text": "*Version:*"
          },
          {
            "type": "mrkdwn",
            "text": message['detail']['image-tag']
          }
        ]
      },
    ],
    attachments: [
      {
        "callback_id": 'deploy_action',
        "text": "Can be reflected in the production",
        "actions": [
          {
            "name":  "Deploy",
            "text":  "Deploy",
            "type":  "button",
            "value": message['detail']['image-tag']
          },
          {
            "name":  "Cancel",
            "text":  "Cancel",
            "type":  "button",
            "value": "cancel_action"
          }
        ]
      }
    ]
  }

  await web.chat.postMessage(params).catch(console.error)

}

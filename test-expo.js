const { Expo } = require('expo-server-sdk');
const expo = new Expo();
expo.sendPushNotificationsAsync([{
  to: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  sound: 'default',
  body: 'test',
  channelId: 'default',
  android: { sound: 'booking_request' },
  ios: { sound: 'booking_request.wav' }
}]).then(console.log).catch(err => console.error(err.message));

import '@twilio-labs/serverless-runtime-types';
import type { ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';

export const handler: ServerlessFunctionSignature<{SIM: string}, {From: string}> = async (context, event, callback) => {
  try {
    const client = context.getTwilioClient();
    const twiml = new Twilio.twiml.VoiceResponse();
    const response = await client.lookups.phoneNumbers(event.From).fetch({addOns: 'nomorobo_spamscore'});
    const score = response.addOns.results.nomorobo_spamscore.result.score;
    const block = score == 1;
    if (block) {
      twiml.reject();
    } else {
      twiml.dial().sim(context.SIM);
    }
    callback(null, twiml);
  } catch (err) {
    callback(err)
  }
};
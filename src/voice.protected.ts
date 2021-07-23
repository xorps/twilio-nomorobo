import '@twilio-labs/serverless-runtime-types';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse'
import { Context, ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';

type Env = {SIM: string};
type Event = {From: string};
type Handler = ServerlessFunctionSignature<Env, Event>;

async function run(context: Context<Env>, event: Event): Promise<VoiceResponse> {
  const client = context.getTwilioClient();
  const twiml = new Twilio.twiml.VoiceResponse();
  const response = await client.lookups
    .phoneNumbers(event.From)
    .fetch({addOns: 'nomorobo_spamscore'});
  const score = response.addOns.results.nomorobo_spamscore.result.score;
  const shouldBlock = score == 1;
  if (shouldBlock) {
    twiml.reject();
  } else {
    twiml.dial().sim(context.SIM);
  }
  return twiml;
}

export const handler: Handler = (context, event, callback) => {
  run(context, event)
    .then(twiml => callback(null, twiml))
    .catch(err => callback(err));
};
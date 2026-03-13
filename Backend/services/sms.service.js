import { request } from 'http';
import axios from 'axios';
export const sendSms = async (phone, otp) => {
  const url = `${process.env.SMS_API_URL}?authentic-key=${process.env.SMS_AUTH_KEY}&senderid=${process.env.SMS_SENDER_ID}&route=${process.env.SMS_ROUTE}&number=${phone}&message=Dear%20Customer%2C%20your%20OTP%20is%20${otp}.%20This%20OTP%20is%20valid%20for%20${process.env.OTP_TTL_MINUTES}%20minutes.%20Do%20not%20share%20this%20code%20with%20anyone.%20-%20Vardhman%20Finance&templateid=${process.env.SMS_TEMPLATE_ID}`;
  await axios.post(url)
    .then(response => {
      console.log("SMS API response:", response.data);
    })
    .catch(error => {
      console.error("Error sending SMS:", error);
    });
 
};

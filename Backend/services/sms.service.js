import axios from 'axios';
export const sendSms = async (phone, otp) => {
  const apiUrl = process.env.SMS_API_URL;
  const authKey = process.env.SMS_AUTH_KEY;
  const senderId = process.env.SMS_SENDER_ID;
  const route = process.env.SMS_ROUTE;
  const templateId = process.env.SMS_TEMPLATE_ID;
  const otpTtlMinutes = process.env.OTP_TTL_MINUTES;
  const url = `${apiUrl}?authentic-key=${authKey}&senderid=${senderId}&route=${route}&number=${phone}&message=Dear%20Customer%2C%20your%20OTP%20is%20${otp}.%20This%20OTP%20is%20valid%20for%20${otpTtlMinutes}%20minutes.%20Do%20not%20share%20this%20code%20with%20anyone.%20-%20Vardhman%20Finance&templateid=${templateId}`;
  await axios.post(url)
    .then(response => {
      console.log("SMS API response:", response.data);
    })
    .catch(error => {
      console.error("Error sending SMS:", error);
    });
 
};

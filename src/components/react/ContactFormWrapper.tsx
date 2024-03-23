import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import ContactForm from "./ContactForm"

interface ContactFormProps {
    recaptchaSiteKey: string;
}

export default ({recaptchaSiteKey}: ContactFormProps) => {
    return <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
        <ContactForm />
  </GoogleReCaptchaProvider>
}
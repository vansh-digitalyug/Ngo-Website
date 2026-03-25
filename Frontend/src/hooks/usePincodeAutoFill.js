import { useState } from "react";

/**
 * usePincodeAutoFill — auto-fills city, district, state from a 6-digit Indian pincode.
 *
 * Usage:
 *   const { fetchPincode, pincodeLoading, pincodeError } = usePincodeAutoFill((info) => {
 *     setForm(f => ({ ...f, district: info.district, state: info.state, city: info.city }));
 *   });
 *
 *   <input onChange={e => { setPin(e.target.value); fetchPincode(e.target.value); }} />
 *
 * info object returned:
 *   { city, district, state, pincode }
 */
export function usePincodeAutoFill(onFill) {
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError]     = useState("");

  const fetchPincode = async (pincode) => {
    setPincodeError("");
    if (!/^\d{6}$/.test(pincode)) return; // only trigger on full 6 digits

    setPincodeLoading(true);
    try {
      const res  = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();

      if (data[0]?.Status !== "Success" || !data[0]?.PostOffice?.length) {
        setPincodeError("Pincode not found");
        setTimeout(() => setPincodeError(""), 3000);
        return;
      }

      const post = data[0].PostOffice[0];
      onFill({
        city:     post.Block || post.Division || post.Name || "",
        district: post.District || "",
        state:    post.State    || "",
        pincode,
      });
    } catch {
      setPincodeError("Could not fetch pincode details");
      setTimeout(() => setPincodeError(""), 3000);
    } finally {
      setPincodeLoading(false);
    }
  };

  return { fetchPincode, pincodeLoading, pincodeError };
}

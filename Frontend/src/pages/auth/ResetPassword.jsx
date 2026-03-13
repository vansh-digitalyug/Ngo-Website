import { Navigate, useLocation, useParams } from "react-router-dom";

function ResetPassword() {
  const { token } = useParams();
  const location = useLocation();
  const queryToken = new URLSearchParams(location.search).get("resetToken");
  const resolvedToken = token || queryToken;

  if (!resolvedToken) {
    return <Navigate to="/login" replace />;
  }

  const encodedToken = encodeURIComponent(resolvedToken);
  return <Navigate to={`/login?resetToken=${encodedToken}`} replace />;
}

export default ResetPassword;

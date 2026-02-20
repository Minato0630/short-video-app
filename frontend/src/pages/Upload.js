import UploadVideo from "../UploadVideo";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Upload({ onUpload }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) navigate("/login");
  }, []);

  if (!user) return null;

  return <UploadVideo />;
}

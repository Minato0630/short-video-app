import { useState } from "react";
import axios from "axios";
import API_URL from "../utils/api";

export default function EditProfile({ user }) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [anime, setAnime] = useState(user.favouriteAnime);

  const save = async () => {
    await axios.put(
      `${API_URL}/api/users/${user.username}`,
      {
        loggedInUser: user.username,
        name,
        bio,
        favouriteAnime: anime
      }
    );

    alert("Profile updated");
  };

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} />
      <input value={anime} onChange={e => setAnime(e.target.value)} />
      <textarea value={bio} onChange={e => setBio(e.target.value)} />
      <button onClick={save}>Save</button>
    </div>
  );
}

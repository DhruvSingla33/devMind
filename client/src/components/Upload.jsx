import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Container = styled.div`...`; // keep same styles
const Wrapper = styled.div`...`;
const Close = styled.div`...`;
const Title = styled.h1`...`;
const Input = styled.input`...`;
const Desc = styled.textarea`...`;
const Button = styled.button`...`;
const Label = styled.label`...`;

const Upload = ({ setOpen }) => {
  const [img, setImg] = useState(undefined);
  const [video, setVideo] = useState(undefined);
  const [user, setUser] = useState(null);
  const [inputs, setInputs] = useState({});
  const [tags, setTags] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/userData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        token: window.localStorage.getItem("token"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.data);
      });
  }, []);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTags = (e) => {
    setTags(e.target.value.split(","));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("img", img);
    formData.append("video", video);
    formData.append("userName", user?.Firstname || "Unknown");
    formData.append("tags", tags);

    for (const key in inputs) {
      formData.append(key, inputs[key]);
    }

    try {
      const res = await axios.post("http://localhost:8000/api/videos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Upload success", res.data);
      navigate("/"); // or any success page
    } catch (err) {
      console.error("Upload error", err);
    }
  };

  return (
    <Container>
      <Wrapper>
        <Close onClick={() => setOpen(false)}>X</Close>
        <Title>Upload a New Video</Title>

        <Label>Video:</Label>
        <Input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} />

        <Input type="text" placeholder="Title" name="title" onChange={handleChange} />
        <Desc placeholder="Description" name="desc" rows={8} onChange={handleChange} />

        <Input
          type="text"
          placeholder="Separate the tags with commas."
          onChange={handleTags}
        />

        <Label>Image:</Label>
        <Input type="file" accept="image/*" onChange={(e) => setImg(e.target.files[0])} />

        <Button onClick={handleUpload}>Upload</Button>
      </Wrapper>
    </Container>
  );
};

export default Upload;

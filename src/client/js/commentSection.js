import { async } from "regenerator-runtime";

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const btn = form.querySelector("button");

const deletebtn = document.querySelectorAll(".deletespan");

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  newComment.dataset.id = id;
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  const span2 = document.createElement("span");
  span2.innerText = "❌";
  span2.className = "deletespan";
  span.innerText = `${text}`;
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);

  videoComments.prepend(newComment);

  span2.addEventListener("click", deletehandle);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;

  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  const { newCommentId } = await response.json();
  console.log(newCommentId);
  textarea.value = "";
  if (response.status === 201) {
    addComment(text, newCommentId);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

const deletehandle = async (e) => {
  const li = e.target.parentElement;
  const { id } = li.dataset;

  const response = await fetch(`/api/videos/${id}/deleteComment`, {
    method: "DELETE",
  });

  if (response.status === 404) {
  } else {
    li.remove();
  }
};

if (deletebtn) {
  for (let i = 0; i < deletebtn.length; i++) {
    deletebtn[i].addEventListener("click", deletehandle);
  }
}

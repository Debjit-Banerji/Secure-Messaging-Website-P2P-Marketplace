import React, { useState, useEffect } from "react";
import Carousel from "react-bootstrap/Carousel";
import styled from "styled-components";
import NavBar from "../components/NavBar.jsx";

export default function Home() {
//   const images = [
//     "/assets/img1.jpg",
//     "/assets/img2.jpg",
//     "/assets/img3.jpg",
//     "/assets/img4.jpg"
//   ];

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page when the component is mounted
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);
  window.onscroll = () => {
    setIsScrolled(window.pageYOffset === 0 ? false : true);
    return () => (window.onscroll = null);
  };

  return (
    <Container>
      <NavBar />
      <Carousel>
        {/* {images.map((url, index) => (
          <Carousel.Item key={index}>
            <CarouselImage
              src={url}
              alt={`Slide ${index + 1}`}
            />
          </Carousel.Item>
        ))} */}
      </Carousel>
    </Container>
  );
}

const Container = styled.div`
  font-family: "Calibri, sans-serif";
`;

const CarouselImage = styled.img`
  width: 100vw;
  height: 100vh - 5rem;
  object-fit: contain;
`;
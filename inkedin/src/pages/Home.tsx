import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TattooCard from "../components/TattooCard";
import "../styles/home.css";

export default function Home() {
  return (
    <>
      <Navbar />

      <section className="hero">
        <h2>Encontre o tatuador perfeito</h2>
        <p>Conectamos você aos melhores artistas da tatuagem</p>
        <button className="btn primary">Explorar</button>
      </section>

      <section className="cards">
        <h2>Destaques</h2>
        <div className="card-container">
          <TattooCard nome="João Ink" estilo="Realismo" preco="R$ 300+" />
          <TattooCard nome="Maria Tattoo" estilo="Old School" preco="R$ 200+" />
          <TattooCard nome="Lucas Art" estilo="Blackwork" preco="R$ 250+" />
        </div>
      </section>

      <Footer />
    </>
  );
}
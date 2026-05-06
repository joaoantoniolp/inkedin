type Props = {
  nome: string;
  estilo: string;
  preco: string;
};

export default function TattooCard({ nome, estilo, preco }: Props) {
  return (
    <div className="card">
      <div className="card-img"></div>
      <h3>{nome}</h3>
      <p>{estilo}</p>
      <p>{preco}</p>
      <button className="btn primary">Ver Perfil</button>
    </div>
  );
}
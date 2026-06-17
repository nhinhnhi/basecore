import { useEffect, useState } from 'react';
import axios from 'axios';

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5001/api/Products?pageSize=6')
      .then(res => setProducts(res.data.items))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {/* Phần header, banner, v.v. giữ nguyên từ template */}
      <div className="product-list">
        {products.map(product => (
          <div key={product.id} className="product-item">
            <img src={product.imageUrl || '/img/default.jpg'} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.price.toLocaleString()} VND</p>
            <button>Thêm vào giỏ</button>
          </div>
        ))}
      </div>
      {/* Footer */}
    </div>
  );
}
export default Home;
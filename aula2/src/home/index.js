import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { formatCurrency, getImageUrl } from '../services/api';

const Home = () => {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState({ id: null, total: 0, itens: [] });
  const [vendas, setVendas] = useState([]);
  const [busca, setBusca] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [carregando, setCarregando] = useState(true);
  const [finalizando, setFinalizando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [ultimaVenda, setUltimaVenda] = useState(null);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [resProdutos, resCarrinho, resVendas] = await Promise.all([
        api.get('/Produto/getAll'),
        api.get('/Carrinho/getAtual'),
        api.get('/Venda/getAll'),
      ]);
      setProdutos(resProdutos.data || []);
      setCarrinho(resCarrinho.data || { id: null, total: 0, itens: [] });
      setVendas(resVendas.data || []);
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao carregar dados da loja.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleAdicionarAoCarrinho = async (produtoId) => {
    setErro('');
    setSucesso('');
    try {
      const res = await api.post('/Carrinho/addItem', { produtoId, quantidade: 1 });
      if (res.data?.carrinho) {
        setCarrinho(res.data.carrinho);
      }
      setSucesso(res.data?.message || 'Produto adicionado ao carrinho!');
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao adicionar produto ao carrinho.');
    }
  };

  const handleAlterarQuantidade = async (itemId, novaQuantidade) => {
    setErro('');
    setSucesso('');
    try {
      const res = await api.patch(`/Carrinho/updateItem/${itemId}`, {
        quantidade: novaQuantidade,
      });
      if (res.data?.carrinho) {
        setCarrinho(res.data.carrinho);
      }
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao atualizar quantidade.');
    }
  };

  const handleRemoverItem = async (itemId) => {
    setErro('');
    setSucesso('');
    try {
      const res = await api.delete(`/Carrinho/removeItem/${itemId}`);
      if (res.data?.carrinho) {
        setCarrinho(res.data.carrinho);
      }
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao remover item do carrinho.');
    }
  };

  const handleLimparCarrinho = async () => {
    setErro('');
    setSucesso('');
    try {
      const res = await api.delete('/Carrinho/clear');
      if (res.data?.carrinho) {
        setCarrinho(res.data.carrinho);
      }
      setSucesso('Carrinho esvaziado!');
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao limpar o carrinho.');
    }
  };

  const handleFinalizarVenda = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!carrinho.itens || carrinho.itens.length === 0) {
      setErro('Adicione ao menos um produto ao carrinho antes de finalizar a venda.');
      return;
    }

    setFinalizando(true);
    try {
      const res = await api.post('/Venda/finalizar', {
        clienteNome: clienteNome.trim() || 'Cliente',
        formaPagamento,
      });

      setUltimaVenda(res.data?.venda || null);
      setSucesso(res.data?.message || 'Venda finalizada com sucesso!');
      setClienteNome('');

      const [resCarrinho, resVendas] = await Promise.all([
        api.get('/Carrinho/getAtual'),
        api.get('/Venda/getAll'),
      ]);
      setCarrinho(resCarrinho.data || { id: null, total: 0, itens: [] });
      setVendas(resVendas.data || []);
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao finalizar a venda.');
    } finally {
      setFinalizando(false);
    }
  };

  const itensCarrinho = carrinho?.itens || [];
  const totalItens = itensCarrinho.reduce((acc, item) => acc + item.quantidade, 0);
  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="page-container">
      <section className="hero-banner">
        <div>
          <span className="hero-tag">E-commerce Oficial</span>
          <h1>Painel de Vendas LojaTech</h1>
          <p>
            Escolha seus produtos favoritos, gerencie seu carrinho em tempo real e finalize seu pedido.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-box">
            <strong>{produtos.length}</strong>
            <span>Produtos</span>
          </div>
          <div className="stat-box">
            <strong>{totalItens}</strong>
            <span>No Carrinho</span>
          </div>
          <div className="stat-box">
            <strong>{vendas.length}</strong>
            <span>Vendas</span>
          </div>
        </div>
      </section>

      {erro && <div className="alert alert-error">{erro}</div>}
      {sucesso && <div className="alert alert-success">{sucesso}</div>}

      {ultimaVenda && (
        <div className="card receipt-card">
          <div className="receipt-header">
            <div>
              <h3>Pedido #{ultimaVenda.id} Confirmado!</h3>
              <p>
                Cliente: <strong>{ultimaVenda.clienteNome}</strong> • Pagamento:{' '}
                <strong>{ultimaVenda.formaPagamento}</strong>
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setUltimaVenda(null)}
            >
              Fechar Comprovante
            </button>
          </div>
          <div className="receipt-total">
            Total Pago: <strong>{formatCurrency(ultimaVenda.valorTotal)}</strong>
          </div>
        </div>
      )}

      <div className="ecommerce-grid">
        <section className="catalog-section">
          <div className="section-toolbar">
            <h2>Catálogo de Produtos</h2>
            <input
              type="search"
              className="search-input"
              placeholder="Buscar produto na loja..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {carregando ? (
            <div className="card">
              <p className="empty-state">Carregando catálogo...</p>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="card empty-catalog">
              <p>Nenhum produto disponível no momento.</p>
              <Link to="/produtos" className="btn btn-primary">
                Cadastrar Produtos
              </Link>
            </div>
          ) : (
            <div className="products-grid">
              {produtosFiltrados.map((produto) => {
                const imgUrl = getImageUrl(produto.imagem);
                return (
                  <article key={produto.id} className="product-card">
                    <div className="product-card-image-wrap">
                      {imgUrl ? (
                        <img src={imgUrl} alt={produto.nome} className="product-card-image" />
                      ) : (
                        <div className="product-card-placeholder">Sem Imagem</div>
                      )}
                    </div>
                    <div className="product-card-body">
                      <h3 className="product-card-title">{produto.nome}</h3>
                      <p className="product-card-price">{formatCurrency(produto.preco)}</p>
                      <button
                        type="button"
                        className="btn btn-primary btn-block"
                        onClick={() => handleAdicionarAoCarrinho(produto.id)}
                      >
                        + Adicionar ao Carrinho
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="cart-sidebar">
          <div className="card cart-card">
            <div className="cart-header">
              <h2>Carrinho de Compras</h2>
              {itensCarrinho.length > 0 && (
                <button
                  type="button"
                  className="btn-link-danger"
                  onClick={handleLimparCarrinho}
                >
                  Limpar
                </button>
              )}
            </div>

            {itensCarrinho.length === 0 ? (
              <p className="empty-state">Seu carrinho está vazio.</p>
            ) : (
              <>
                <ul className="cart-items-list">
                  {itensCarrinho.map((item) => {
                    const produto = item.produto;
                    const precoUnit = Number(produto ? produto.preco : item.precoUnitario);
                    const subtotal = precoUnit * item.quantidade;
                    const imgUrl = getImageUrl(produto?.imagem);

                    return (
                      <li key={item.id} className="cart-item">
                        <div className="cart-item-info">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={produto?.nome || 'Produto'}
                              className="cart-item-thumb"
                            />
                          ) : (
                            <div className="cart-item-thumb placeholder-thumb">Img</div>
                          )}
                          <div>
                            <h4>{produto?.nome || `Produto #${item.produtoId}`}</h4>
                            <span className="cart-item-unit">
                              {formatCurrency(precoUnit)} un.
                            </span>
                          </div>
                        </div>

                        <div className="cart-item-controls">
                          <div className="qty-control">
                            <button
                              type="button"
                              aria-label="Diminuir quantidade"
                              onClick={() => handleAlterarQuantidade(item.id, item.quantidade - 1)}
                            >
                              -
                            </button>
                            <span>{item.quantidade}</span>
                            <button
                              type="button"
                              aria-label="Aumentar quantidade"
                              onClick={() => handleAlterarQuantidade(item.id, item.quantidade + 1)}
                            >
                              +
                            </button>
                          </div>
                          <strong className="cart-item-subtotal">
                            {formatCurrency(subtotal)}
                          </strong>
                          <button
                            type="button"
                            className="btn-remove-item"
                            title="Remover item"
                            onClick={() => handleRemoverItem(item.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Itens ({totalItens})</span>
                    <span>{formatCurrency(carrinho.total)}</span>
                  </div>
                  <div className="summary-row summary-total">
                    <span>Total</span>
                    <strong>{formatCurrency(carrinho.total)}</strong>
                  </div>
                </div>

                <form onSubmit={handleFinalizarVenda} className="checkout-form">
                  <div className="form-group">
                    <label htmlFor="cliente-nome">Nome do Cliente</label>
                    <input
                      id="cliente-nome"
                      type="text"
                      placeholder="Ex: Maria Silva"
                      value={clienteNome}
                      onChange={(e) => setClienteNome(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="forma-pagamento">Forma de Pagamento</label>
                    <select
                      id="forma-pagamento"
                      value={formaPagamento}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                    >
                      <option value="PIX">PIX</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Boleto">Boleto</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success btn-block"
                    disabled={finalizando}
                  >
                    {finalizando ? 'Finalizando...' : 'Finalizar Venda'}
                  </button>
                </form>
              </>
            )}
          </div>

          <div className="card sales-history-card">
            <h3>Últimas Vendas</h3>
            {vendas.length === 0 ? (
              <p className="empty-state">Nenhuma venda registrada ainda.</p>
            ) : (
              <ul className="sales-list">
                {vendas.slice(0, 5).map((venda) => (
                  <li key={venda.id} className="sale-row">
                    <div>
                      <strong>
                        Venda #{venda.id} - {venda.clienteNome}
                      </strong>
                      <div className="sale-meta">
                        {venda.formaPagamento} • {venda.itens?.length || 0} item(ns)
                      </div>
                    </div>
                    <strong className="sale-amount">{formatCurrency(venda.valorTotal)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;

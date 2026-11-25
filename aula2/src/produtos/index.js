import { useEffect, useRef, useState } from 'react';
import api, { formatCurrency, getImageUrl } from '../services/api';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_EXT_REGEX = /\.(jpeg|jpg|png)$/i;

const Produto = () => {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [imagemFile, setImagemFile] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const fileInputRef = useRef(null);

  const carregarProdutos = async () => {
    setCarregando(true);
    try {
      const response = await api.get('/Produto/getAll');
      setProdutos(response.data || []);
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao carregar produtos da API.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    return () => {
      if (imagemPreview && imagemPreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagemPreview);
      }
    };
  }, [imagemPreview]);

  const limparFormulario = () => {
    setNome('');
    setPreco('');
    setImagemFile(null);
    if (imagemPreview && imagemPreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagemPreview);
    }
    setImagemPreview(null);
    setEditandoId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePrecoChange = (e) => {
    const valor = e.target.value;
    setPreco(valor);
    setSucesso('');

    if (valor !== '' && Number(valor) < 0) {
      setErro('O preço não pode ser um número negativo!');
    } else {
      setErro('');
    }
  };

  const handleImagemChange = (e) => {
    const file = e.target.files?.[0];
    setSucesso('');

    if (!file) {
      setImagemFile(null);
      return;
    }

    const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type);
    const isExtValid = ALLOWED_EXT_REGEX.test(file.name);

    if (!isMimeValid || !isExtValid) {
      setErro('Formato de imagem inválido! Aceitamos apenas arquivos .jpeg e .png.');
      setImagemFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setErro('');
    setImagemFile(file);
    if (imagemPreview && imagemPreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagemPreview);
    }
    setImagemPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!nome.trim()) {
      setErro('O nome do produto é obrigatório!');
      return;
    }

    if (preco === '' || preco === null) {
      setErro('O preço do produto é obrigatório!');
      return;
    }

    const precoNumero = Number(preco);
    if (Number.isNaN(precoNumero) || !Number.isFinite(precoNumero)) {
      setErro('Informe um preço numérico válido!');
      return;
    }

    if (precoNumero < 0) {
      setErro('O preço não pode ser um número negativo!');
      return;
    }

    const formData = new FormData();
    formData.append('nome', nome.trim());
    formData.append('preco', precoNumero.toFixed(2));
    if (imagemFile) {
      formData.append('imagem', imagemFile);
    }

    setSalvando(true);
    try {
      if (editandoId) {
        const res = await api.patch(`/Produto/update/${editandoId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSucesso(res.data?.message || 'Produto atualizado com sucesso!');
      } else {
        const res = await api.post('/Produto/create', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSucesso(res.data?.message || 'Produto cadastrado com sucesso!');
      }

      limparFormulario();
      await carregarProdutos();
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao salvar o produto.');
    } finally {
      setSalvando(false);
    }
  };

  const handleEditar = async (produto) => {
    setErro('');
    setSucesso('');
    try {
      const res = await api.get(`/Produto/getById/${produto.id}`);
      const dados = res.data;
      setEditandoId(dados.id);
      setNome(dados.nome);
      setPreco(String(dados.preco));
      setImagemFile(null);
      setImagemPreview(getImageUrl(dados.imagem));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao carregar dados do produto.');
    }
  };

  const handleExcluir = async (produto) => {
    const confirmou = window.confirm(`Deseja realmente excluir o produto "${produto.nome}"?`);
    if (!confirmou) return;

    setErro('');
    setSucesso('');
    try {
      const res = await api.delete(`/Produto/delete/${produto.id}`);
      setSucesso(res.data?.message || 'Produto deletado com sucesso!');
      if (editandoId === produto.id) {
        limparFormulario();
      }
      await carregarProdutos();
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao excluir o produto.');
    }
  };

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Gerenciamento de Produtos</h1>
          <p className="page-subtitle">
            Cadastre, edite, visualize e remova produtos do catálogo da loja.
          </p>
        </div>
        <span className="badge-count">{produtos.length} produtos cadastrados</span>
      </div>

      {erro && <div className="alert alert-error">{erro}</div>}
      {sucesso && <div className="alert alert-success">{sucesso}</div>}

      <div className="crud-layout">
        <section className="card form-card">
          <h2>{editandoId ? `Editar Produto #${editandoId}` : 'Novo Produto'}</h2>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label htmlFor="produto-nome">Nome do Produto *</label>
              <input
                id="produto-nome"
                type="text"
                placeholder="Ex: Teclado Mecânico RGB"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="produto-preco">Preço (R$) *</label>
              <input
                id="produto-preco"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={preco}
                onChange={handlePrecoChange}
                required
              />
              <small className="field-hint">Apenas valores iguais ou maiores que zero.</small>
            </div>

            <div className="form-group">
              <label htmlFor="produto-imagem">Imagem (.jpeg ou .png)</label>
              <input
                ref={fileInputRef}
                id="produto-imagem"
                type="file"
                accept=".jpeg,.jpg,.png,image/jpeg,image/png"
                onChange={handleImagemChange}
              />
              <small className="field-hint">
                Formatos aceitos: apenas <strong>.jpeg</strong> e <strong>.png</strong> (máx. 5MB).
              </small>
            </div>

            {imagemPreview && (
              <div className="image-preview-box">
                <span className="preview-label">Pré-visualização:</span>
                <img src={imagemPreview} alt="Pré-visualização do produto" className="image-preview" />
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando
                  ? 'Salvando...'
                  : editandoId
                  ? 'Atualizar Produto'
                  : 'Cadastrar Produto'}
              </button>
              {editandoId && (
                <button type="button" className="btn btn-secondary" onClick={limparFormulario}>
                  Cancelar Edição
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card list-card">
          <div className="list-header">
            <h2>Produtos Cadastrados</h2>
            <input
              type="search"
              className="search-input"
              placeholder="Buscar por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {carregando ? (
            <p className="empty-state">Carregando produtos...</p>
          ) : produtosFiltrados.length === 0 ? (
            <p className="empty-state">Nenhum produto encontrado.</p>
          ) : (
            <div className="table-responsive">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Imagem</th>
                    <th>Nome</th>
                    <th>Preço</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosFiltrados.map((produto) => {
                    const imgUrl = getImageUrl(produto.imagem);
                    return (
                      <tr key={produto.id}>
                        <td>
                          {imgUrl ? (
                            <img src={imgUrl} alt={produto.nome} className="table-thumb" />
                          ) : (
                            <div className="table-thumb placeholder-thumb">Sem foto</div>
                          )}
                        </td>
                        <td className="product-name-cell">{produto.nome}</td>
                        <td className="product-price-cell">{formatCurrency(produto.preco)}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="btn btn-edit btn-sm"
                              onClick={() => handleEditar(produto)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleExcluir(produto)}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Produto;

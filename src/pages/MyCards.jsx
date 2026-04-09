import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { getMyCards, createCard, updateCard } from '@/lib/db'
import { generateQRCode } from '@/lib/qr'
import { Link } from 'react-router-dom'

const MyCards = () => {
  const { user, isAuthenticated } = useAuth()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    player_name: '',
    year: '',
    brand: ''
  })

  useEffect(() => {
    if (isAuthenticated) {
      fetchCards()
    }
  }, [isAuthenticated])

  const fetchCards = async () => {
    setLoading(true)
    const { data } = await getMyCards(user.id)
    setCards(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...formData, user_id: user.id }
    const { data: newCard, error } = await createCard(payload)
    if (error) {
      console.error('Error creating card:', error)
    } else {
      // Generate QR if empty
      if (!newCard.qr_code) {
        const qrCode = generateQRCode(newCard.id)
        await updateCard(newCard.id, { qr_code: qrCode })
        newCard.qr_code = qrCode
      }
      setFormData({ title: '', player_name: '', year: '', brand: '' })
      fetchCards()
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to Origins</h1>
            <p className="text-muted-foreground">Track your sports card collection with QR codes and stories.</p>
          </div>
          <div className="space-y-3">
            <Link to="/auth" className="block">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Sign In to Get Started
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              New user? <Link to="/auth" className="text-primary hover:underline">Create your account</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Cards</h1>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Player Name</label>
          <input
            type="text"
            name="player_name"
            value={formData.player_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Year</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Brand</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Card
        </button>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Link key={card.id} to={`/cards/${card.id}`}>
              <div className="border border-gray-300 rounded-md p-4 cursor-pointer hover:bg-gray-50">
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p>Player: {card.player_name}</p>
                <p>Year: {card.year}</p>
                <p>Brand: {card.brand}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyCards
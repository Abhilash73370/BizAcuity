import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { UserContext } from '../App';

const Landing = () => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { registeredUser } = useContext(UserContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);

  // Extra protection - redirect to login if not authenticated
  useEffect(() => {
    if (!registeredUser?.isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchDrafts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/drafts/${registeredUser.id}`);
        if (!response.ok) throw new Error('Failed to fetch drafts');
        const data = await response.json();
        setDrafts(data);
      } catch (err) {
        console.error('Fetch drafts error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [registeredUser, navigate]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleNewDesign = () => {
    navigate('/wall');
  };

  const handleOpenDraft = (draftId) => {
    navigate(`/wall?draftId=${draftId}`);
  };

  const handleDeleteClick = (draft) => {
    setDraftToDelete(draft);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!draftToDelete) return;

    try {
      const response = await fetch(`http://localhost:5001/drafts/${draftToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete draft');

      // Remove the deleted draft from state
      setDrafts(drafts.filter(d => d._id !== draftToDelete._id));
      setShowDeleteModal(false);
      setDraftToDelete(null);
    } catch (error) {
      console.error('Delete draft error:', error);
      alert('Failed to delete draft. Please try again.');
    }
  };

  // Don't render anything until we verify authentication
  if (!registeredUser?.isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f1e6cb]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">
            Welcome back, {registeredUser.name}!
          </h1>
          <button
            onClick={handleNewDesign}
            className="bg-primary text-secondary px-4 py-2 rounded-lg text-base font-semibold shadow-md hover:bg-primary-dark transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Start New Design
          </button>
        </div>

        {/* Drafts Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Your Saved Designs</h2>
            <span className="text-gray-600">
              {drafts.length} {drafts.length === 1 ? 'Design' : 'Designs'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-8 text-red-600">
                {error}
              </div>
            ) : drafts.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg p-8 text-center">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No saved designs yet</h3>
                <p className="text-gray-600 mb-4">Start creating your first wall design!</p>
                <button
                  onClick={handleNewDesign}
                  className="bg-primary text-secondary px-4 py-2 rounded-lg text-base font-semibold shadow-md hover:bg-primary-dark transition flex items-center gap-2 mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create New Design
                </button>
              </div>
            ) : (
              drafts.map((draft) => (
                <div
                  key={draft._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 relative group p-4"
                >
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(draft)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50 z-10"
                  >
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {draft.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Last edited: {formatDate(draft.updatedAt)}
                    </p>
                    <button
                      onClick={() => handleOpenDraft(draft._id)}
                      className="w-full bg-primary text-secondary px-4 py-2 rounded-lg text-base font-semibold shadow-md hover:bg-primary-dark transition"
                    >
                      Open Design
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Delete Design?
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{draftToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDraftToDelete(null);
                }}
                className="px-4 py-2 rounded-lg font-semibold text-primary-dark hover:bg-gray-100 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing; 
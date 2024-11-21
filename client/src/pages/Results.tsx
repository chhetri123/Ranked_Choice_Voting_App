import React, { useState } from 'react';
import { useSnapshot } from 'valtio';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import ResultCard from '../components/ui/ResultCard';
import { actions, state } from '../state';

export const Results: React.FC = () => {
  const { poll, isAdmin, participantCount, rankingsCount } = useSnapshot(state);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isLeavePollOpen, setIsLeavePollOpen] = useState(false);

  return (
    <>
      <div className="w-full px-4 py-6">
        {/* Topic Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {poll?.topic}
          </h1>
          <div className="text-gray-500">Poll Results</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-semibold text-gray-700">
                    Rankings
                  </span>
                  {!!poll?.results.length && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-600 text-sm font-medium rounded-full">
                      Final Results
                    </span>
                  )}
                </div>
                {!!poll?.results.length && (
                  <button
                    className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
                    onClick={() => setIsLeavePollOpen(true)}
                  >
                    Leave Poll
                  </button>
                )}
              </div>

              {poll?.results.length ? (
                <ResultCard results={poll?.results} />
              ) : (
                <div className="bg-purple-50 rounded-xl p-8">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-4">
                      <span className="text-3xl font-bold text-purple-600">
                        {rankingsCount}/{participantCount}
                      </span>
                    </div>
                    <p className="text-gray-600 text-lg">
                      participants have submitted their votes
                    </p>
                  </div>
                </div>
              )}

              {isAdmin && !poll?.results.length && (
                <div className="mt-8 flex justify-center">
                  <button
                    className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
                    onClick={() => setIsConfirmationOpen(true)}
                  >
                    End Poll & Calculate Results
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Participants Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-4">
              <div className="p-6 bg-gray-50 border-b">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span>Participants</span>
                  <span className="px-2.5 py-0.5 bg-purple-100 text-purple-600 text-sm font-medium rounded-full">
                    {participantCount}
                  </span>
                </h2>
              </div>
              <div className="divide-y max-h-[calc(100vh-300px)] overflow-y-auto">
                {Object.entries(poll?.participants || {}).map(([id, name]) => (
                  <div
                    key={id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-700 font-medium">{name}</span>
                    {id === poll?.adminID && (
                      <span className="px-3 py-1 text-sm bg-orange-100 text-orange-600 rounded-full font-medium">
                        Admin
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {!isAdmin && !poll?.results.length && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-600 text-sm text-center">
                Waiting for Admin{' '}
                <span className="font-semibold text-gray-700">
                  {poll?.participants[poll?.adminID]}
                </span>{' '}
                to finalize the poll
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationDialog
        message="Are you sure you want to close the poll and calculate the results?"
        showDialog={isConfirmationOpen && isAdmin}
        onCancel={() => setIsConfirmationOpen(false)}
        onConfirm={() => {
          actions.closePoll();
          setIsConfirmationOpen(false);
        }}
      />

      <ConfirmationDialog
        message="Are you sure you want to leave? You will lose access to the results."
        showDialog={isLeavePollOpen}
        onCancel={() => setIsLeavePollOpen(false)}
        onConfirm={() => actions.startOver()}
      />
    </>
  );
};

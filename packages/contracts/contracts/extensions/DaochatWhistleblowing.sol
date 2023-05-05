//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "../interfaces/IDaochatWhistleblowing.sol";
import "../interfaces/IDaochatVerifier.sol";
import "../base/DaochatGroups.sol";

/// @title Daochat whistleblowing contract.
/// @notice It allows users to leak information anonymously .
/// @dev The following code allows you to create entities for whistleblowers (e.g. non-profit
/// organization, newspaper) and allow them to leak anonymously.
/// Leaks can be IPFS hashes, permanent links or other kinds of references.
contract DaochatWhistleblowing is IDaochatWhistleblowing, DaochatGroups {
    IDaochatVerifier public verifier;

    /// @dev Gets an entity id and return its editor address.
    mapping(uint256 => address) private entities;

    /// @dev Checks if the editor is the transaction sender.
    /// @param entityId: Id of the entity.
    modifier onlyEditor(uint256 entityId) {
        if (entities[entityId] != _msgSender()) {
            revert Daochat__CallerIsNotTheEditor();
        }

        _;
    }

    /// @dev Initializes the Daochat verifier used to verify the user's ZK proofs.
    /// @param _verifier: Daochat verifier address.
    constructor(IDaochatVerifier _verifier) {
        verifier = _verifier;
    }

    /// @dev See {IDaochatWhistleblowing-createEntity}.
    function createEntity(uint256 entityId, address editor, uint256 merkleTreeDepth) public override {
        if (merkleTreeDepth < 16 || merkleTreeDepth > 32) {
            revert Daochat__MerkleTreeDepthIsNotSupported();
        }

        _createGroup(entityId, merkleTreeDepth);

        entities[entityId] = editor;

        emit EntityCreated(entityId, editor);
    }

    /// @dev See {IDaochatWhistleblowing-addWhistleblower}.
    function addWhistleblower(uint256 entityId, uint256 identityCommitment) public override onlyEditor(entityId) {
        _addMember(entityId, identityCommitment);
    }

    /// @dev See {IDaochatWhistleblowing-removeWhistleblower}.
    function removeWhistleblower(
        uint256 entityId,
        uint256 identityCommitment,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) public override onlyEditor(entityId) {
        _removeMember(entityId, identityCommitment, proofSiblings, proofPathIndices);
    }

    /// @dev See {IDaochatWhistleblowing-publishLeak}.
    function publishLeak(
        uint256 leak,
        uint256 nullifierHash,
        uint256 entityId,
        uint256[8] calldata proof
    ) public override {
        uint256 merkleTreeDepth = getMerkleTreeDepth(entityId);
        uint256 merkleTreeRoot = getMerkleTreeRoot(entityId);

        verifier.verifyProof(merkleTreeRoot, nullifierHash, leak, entityId, proof, merkleTreeDepth);

        emit LeakPublished(entityId, leak);
    }
}

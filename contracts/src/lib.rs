#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod echomint_nft {
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::prelude::format;
    use ink::storage::Mapping;

    /// Represents the mood state of an NFT
    #[derive(Debug, Clone, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum MoodState {
        Bullish,
        Bearish,
        Neutral,
        Volatile,
        PositiveSentiment,
        NegativeSentiment,
    }

    /// NFT metadata structure
    #[derive(Debug, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct NFTMetadata {
        pub name: String,
        pub coin: String,
        pub mood: MoodState,
        pub image_url: String,
        pub created_at: u64,
        pub last_updated: u64,
    }

    use ink::primitives::H160;

    #[ink(storage)]
    pub struct EchoMintNFT {
        /// Total supply of NFTs
        total_supply: u64,
        /// Mapping from token ID to owner
        token_owners: Mapping<u64, H160>,
        /// Mapping from owner to owned token IDs
        owned_tokens: Mapping<(H160, u64), u64>,
        /// Mapping from owner to token count
        owned_tokens_count: Mapping<H160, u64>,
        /// Mapping from token ID to metadata
        token_metadata: Mapping<u64, NFTMetadata>,
        /// Contract owner (can update moods via Hyperbridge)
        owner: H160,
        /// Mapping from token ID to approved address
        token_approvals: Mapping<u64, H160>,
        /// Mapping from owner to operator approvals
        operator_approvals: Mapping<(H160, H160), bool>,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        NotOwner,
        NotApproved,
        TokenNotFound,
        TokenAlreadyExists,
        NotAllowed,
        TransferToZeroAddress,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    impl Default for EchoMintNFT {
        fn default() -> Self {
            Self::new()
        }
    }

    impl EchoMintNFT {
        /// Constructor that initializes the contract
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                total_supply: 0,
                token_owners: Mapping::default(),
                owned_tokens: Mapping::default(),
                owned_tokens_count: Mapping::default(),
                token_metadata: Mapping::default(),
                owner: Self::env().caller(),
                token_approvals: Mapping::default(),
                operator_approvals: Mapping::default(),
            }
        }

        /// Mint a new NFT
        #[ink(message)]
        pub fn mint(&mut self, to: H160, coin: String, initial_mood: MoodState) -> Result<u64> {
            let token_id = self.total_supply;

            if self.token_owners.contains(token_id) {
                return Err(Error::TokenAlreadyExists);
            }

            let timestamp = self.env().block_timestamp();

            let metadata = NFTMetadata {
                name: format!("{} Echo #{:03}", coin, token_id),
                coin: coin.clone(),
                mood: initial_mood,
                image_url: String::from("ipfs://placeholder"), // Will be updated by AI generator
                created_at: timestamp,
                last_updated: timestamp,
            };

            // Update storage
            self.token_owners.insert(token_id, &to);
            self.token_metadata.insert(token_id, &metadata);

            // Update owner's token list
            let owner_token_count = self.owned_tokens_count.get(to).unwrap_or(0);
            self.owned_tokens.insert((to, owner_token_count), &token_id);
            self.owned_tokens_count.insert(to, &owner_token_count.saturating_add(1));

            self.total_supply = self.total_supply.saturating_add(1);

            // Emit event
            self.env().emit_event(Transfer {
                from: None,
                to: Some(to),
                token_id,
            });

            self.env().emit_event(Minted {
                token_id,
                owner: to,
                coin,
            });

            Ok(token_id)
        }

        /// Update NFT mood state (only callable by contract owner via Hyperbridge)
        #[ink(message)]
        pub fn update_mood(&mut self, token_id: u64, new_mood: MoodState) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(Error::NotOwner);
            }

            let mut metadata = self.token_metadata.get(token_id).ok_or(Error::TokenNotFound)?;
            metadata.mood = new_mood;
            metadata.last_updated = self.env().block_timestamp();

            self.token_metadata.insert(token_id, &metadata);

            self.env().emit_event(MoodUpdated {
                token_id,
                new_mood: metadata.mood,
            });

            Ok(())
        }

        /// Update NFT image URL (for AI-generated images)
        #[ink(message)]
        pub fn update_image(&mut self, token_id: u64, new_image_url: String) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(Error::NotOwner);
            }

            let mut metadata = self.token_metadata.get(token_id).ok_or(Error::TokenNotFound)?;
            metadata.image_url = new_image_url;
            metadata.last_updated = self.env().block_timestamp();

            self.token_metadata.insert(token_id, &metadata);

            Ok(())
        }

        /// Get NFT metadata
        #[ink(message)]
        pub fn get_metadata(&self, token_id: u64) -> Option<NFTMetadata> {
            self.token_metadata.get(token_id)
        }

        /// Get owner of a token
        #[ink(message)]
        pub fn owner_of(&self, token_id: u64) -> Option<H160> {
            self.token_owners.get(token_id)
        }

        /// Get total supply
        #[ink(message)]
        pub fn total_supply(&self) -> u64 {
            self.total_supply
        }

        /// Get balance of an owner
        #[ink(message)]
        pub fn balance_of(&self, owner: H160) -> u64 {
            self.owned_tokens_count.get(owner).unwrap_or(0)
        }

        /// Transfer NFT
        #[ink(message)]
        pub fn transfer(&mut self, to: H160, token_id: u64) -> Result<()> {
            let caller = self.env().caller();
            let owner = self.owner_of(token_id).ok_or(Error::TokenNotFound)?;

            if caller != owner && !self.is_approved_or_owner(caller, token_id) {
                return Err(Error::NotApproved);
            }

            if to == H160::from([0u8; 20]) {
                return Err(Error::TransferToZeroAddress);
            }

            // Clear approvals
            self.token_approvals.remove(token_id);

            // Update owner's token list
            let owner_token_count = self.owned_tokens_count.get(owner).unwrap_or(0);
            if owner_token_count > 0 {
                self.owned_tokens_count.insert(owner, &owner_token_count.saturating_sub(1));
            }

            // Update new owner's token list
            let to_token_count = self.owned_tokens_count.get(to).unwrap_or(0);
            self.owned_tokens.insert((to, to_token_count), &token_id);
            self.owned_tokens_count.insert(to, &to_token_count.saturating_add(1));

            // Transfer ownership
            self.token_owners.insert(token_id, &to);

            self.env().emit_event(Transfer {
                from: Some(owner),
                to: Some(to),
                token_id,
            });

            Ok(())
        }

        /// Approve an address to transfer a specific token
        #[ink(message)]
        pub fn approve(&mut self, to: H160, token_id: u64) -> Result<()> {
            let caller = self.env().caller();
            let owner = self.owner_of(token_id).ok_or(Error::TokenNotFound)?;

            if caller != owner && !self.is_operator_approved(owner, caller) {
                return Err(Error::NotApproved);
            }

            self.token_approvals.insert(token_id, &to);

            self.env().emit_event(Approval {
                owner,
                approved: to,
                token_id,
            });

            Ok(())
        }

        /// Set operator approval for all tokens
        #[ink(message)]
        pub fn set_approval_for_all(&mut self, operator: H160, approved: bool) -> Result<()> {
            let caller = self.env().caller();
            self.operator_approvals.insert((caller, operator), &approved);

            self.env().emit_event(ApprovalForAll {
                owner: caller,
                operator,
                approved,
            });

            Ok(())
        }

        /// Get approved address for a token
        #[ink(message)]
        pub fn get_approved(&self, token_id: u64) -> Option<H160> {
            self.token_approvals.get(token_id)
        }

        /// Check if an operator is approved for all tokens of an owner
        #[ink(message)]
        pub fn is_approved_for_all(&self, owner: H160, operator: H160) -> bool {
            self.operator_approvals.get((owner, operator)).unwrap_or(false)
        }

        /// Helper function to check if caller is approved or owner
        fn is_approved_or_owner(&self, caller: H160, token_id: u64) -> bool {
            let owner = match self.owner_of(token_id) {
                Some(o) => o,
                None => return false,
            };

            caller == owner
                || self.get_approved(token_id) == Some(caller)
                || self.is_approved_for_all(owner, caller)
        }

        /// Helper function to check operator approval
        fn is_operator_approved(&self, owner: H160, operator: H160) -> bool {
            self.operator_approvals.get((owner, operator)).unwrap_or(false)
        }

        /// Get tokens owned by an address
        #[ink(message)]
        pub fn tokens_of_owner(&self, owner: H160) -> Vec<u64> {
            let count = self.balance_of(owner);
            let mut tokens = Vec::new();

            for i in 0..count {
                if let Some(token_id) = self.owned_tokens.get((owner, i)) {
                    tokens.push(token_id);
                }
            }

            tokens
        }
    }

    /// Events
    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<H160>,
        #[ink(topic)]
        to: Option<H160>,
        #[ink(topic)]
        token_id: u64,
    }

    #[ink(event)]
    pub struct Approval {
        #[ink(topic)]
        owner: H160,
        #[ink(topic)]
        approved: H160,
        #[ink(topic)]
        token_id: u64,
    }

    #[ink(event)]
    pub struct ApprovalForAll {
        #[ink(topic)]
        owner: H160,
        #[ink(topic)]
        operator: H160,
        approved: bool,
    }

    #[ink(event)]
    pub struct Minted {
        #[ink(topic)]
        token_id: u64,
        #[ink(topic)]
        owner: H160,
        coin: String,
    }

    #[ink(event)]
    pub struct MoodUpdated {
        #[ink(topic)]
        token_id: u64,
        new_mood: MoodState,
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn test_mint() {
            let mut contract = EchoMintNFT::new();
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            let token_id = contract.mint(accounts.alice, String::from("SOL"), MoodState::Bullish).unwrap();

            assert_eq!(token_id, 0);
            assert_eq!(contract.total_supply(), 1);
            assert_eq!(contract.owner_of(token_id), Some(accounts.alice));
            assert_eq!(contract.balance_of(accounts.alice), 1);
        }

        #[ink::test]
        fn test_transfer() {
            let mut contract = EchoMintNFT::new();
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            let token_id = contract.mint(accounts.alice, String::from("DOT"), MoodState::Neutral).unwrap();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            contract.transfer(accounts.bob, token_id).unwrap();

            assert_eq!(contract.owner_of(token_id), Some(accounts.bob));
            assert_eq!(contract.balance_of(accounts.alice), 0);
            assert_eq!(contract.balance_of(accounts.bob), 1);
        }

        #[ink::test]
        fn test_mood_update() {
            let mut contract = EchoMintNFT::new();
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            let token_id = contract.mint(accounts.alice, String::from("BTC"), MoodState::Bullish).unwrap();

            // Update mood
            contract.update_mood(token_id, MoodState::Bearish).unwrap();

            let metadata = contract.get_metadata(token_id).unwrap();
            assert_eq!(metadata.mood, MoodState::Bearish);
        }
    }
}

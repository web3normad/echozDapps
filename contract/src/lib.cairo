use starknet::ContractAddress;

#[starknet::interface]
trait IMusicSharePlatform<TContractState> {
    fn upload_song(
        ref self: TContractState,
        name: felt252,
        genre: felt252,
        ipfs_audio_hash: felt252,
        ipfs_artwork_hash: felt252,
        total_shares: u256,
        share_price: u256
    ) -> u256;
    fn buy_shares(ref self: TContractState, song_id: u256, shares_count: u256);
    fn distribute_revenue(ref self: TContractState, song_id: u256, revenue: u256);
    fn get_song_details(self: @TContractState, song_id: u256) -> (felt252, felt252, felt252, felt252, u256, u256);
    fn get_shareholders(self: @TContractState, song_id: u256) -> (Span<ContractAddress>, Span<u256>);
    fn get_all_song_ids(self: @TContractState) -> Span<u256>;
}

#[starknet::contract]
mod MusicPlatform {
use core::starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };


    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    // use core::starknet::storage::{Map,StoragePathEntry, StoragePointerWriteAccess, StoragePointerReadAccess};
    use core::array::{Array, ArrayTrait, Span};

    #[storage]
    struct Storage {
        owner: ContractAddress,
        token_ids: u256,
        song_ids: u256,
        music_track_artist: Map<u256, ContractAddress>,
        music_track_name: Map<u256, felt252>,
        music_track_genre: Map<u256, felt252>,
        music_track_audio_hash: Map<u256, felt252>,
        music_track_artwork_hash: Map<u256, felt252>,
        music_track_total_shares: Map<u256, u256>,
        music_track_share_price: Map<u256, u256>,
        music_track_revenue: Map<u256, u256>,
        music_track_release_date: Map<u256, u64>,
        all_song_ids: Map<u256, u256>,
        song_ids_length: u256,
        shareholder_shares: Map<(u256, ContractAddress), u256>,
        token_uri: Map<u256, felt252>,
        owner_of: Map<u256, ContractAddress>
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        SongUploaded: SongUploaded,
        SharePurchased: SharePurchased,
        RevenueDistributed: RevenueDistributed
    }

    #[derive(Drop, starknet::Event)]
    struct SongUploaded {
        #[key]
        song_id: u256,
        artist: ContractAddress,
        name: felt252,
        genre: felt252,
        total_shares: u256,
        share_price: u256
    }

    #[derive(Drop, starknet::Event)]
    struct SharePurchased {
        #[key]
        song_id: u256,
        investor: ContractAddress,
        shares_bought: u256
    }

    #[derive(Drop, starknet::Event)]
    struct RevenueDistributed {
        #[key]
        song_id: u256,
        total_revenue: u256
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
    let owner:ContractAddress =0x03807Af44A92AAFD8e9D6D2dE36DFba5f07b977bb8a14881d52AAC236d07512c.try_into().unwrap();
        self.owner.write(owner);
        self.song_ids_length.write(0);
    }

    #[abi(embed_v0)]
    impl MusicSharePlatform of super::IMusicSharePlatform<ContractState> {
        fn upload_song(
            ref self: ContractState,
            name: felt252,
            genre: felt252,
            ipfs_audio_hash: felt252,
            ipfs_artwork_hash: felt252,
            total_shares: u256,
            share_price: u256
        ) -> u256 {
            assert(total_shares > 0, 'Total shares must be > 0');
            assert(share_price > 0, 'Share price must be > 0');

            let new_song_id = self.song_ids.read() + 1;
            self.song_ids.write(new_song_id);

            // Store track data
            self.music_track_artist.entry(new_song_id).write(get_caller_address());
            self.music_track_name.entry(new_song_id).write(name);
            self.music_track_genre.entry(new_song_id).write(genre);
            self.music_track_audio_hash.entry(new_song_id).write(ipfs_audio_hash);
            self.music_track_artwork_hash.entry(new_song_id).write(ipfs_artwork_hash);
            self.music_track_total_shares.entry(new_song_id).write(total_shares);
            self.music_track_share_price.entry(new_song_id).write(share_price);
            self.music_track_release_date.entry(new_song_id).write(get_block_timestamp());
            self.music_track_revenue.entry(new_song_id).write(0);
            
            // Update song ids array
            let length = self.song_ids_length.read();
            self.all_song_ids.entry(length).write(new_song_id);
            self.song_ids_length.write(length + 1);

            self.emit(Event::SongUploaded(SongUploaded {
                song_id: new_song_id,
                artist: get_caller_address(),
                name,
                genre,
                total_shares,
                share_price
            }));

            new_song_id
        }

        fn buy_shares(
            ref self: ContractState,
            song_id: u256,
            shares_count: u256
        ) {
            let total_shares = self.music_track_total_shares.entry(song_id).read();
            let caller = get_caller_address();
            
            assert(shares_count > 0, 'Must buy at least one share');
            assert(total_shares >= shares_count, 'Not enough shares');
            
            let current_shares = self.shareholder_shares.entry((song_id, caller)).read();
            let new_shares = current_shares + shares_count;
            
            self.shareholder_shares.entry((song_id, caller)).write(new_shares);
            self.music_track_total_shares.entry(song_id).write(total_shares - shares_count);

            // Mint NFT
            let new_token_id = self.token_ids.read() + 1;
            self.token_ids.write(new_token_id);
            self.owner_of.entry(new_token_id).write(caller);
            let v= self.music_track_artwork_hash.entry(song_id).read();
            self.token_uri.entry(new_token_id).write(v);

            self.emit(Event::SharePurchased(SharePurchased {
                song_id,
                investor: caller,
                shares_bought: shares_count
            }));
        }

        fn distribute_revenue(
            ref self: ContractState,
            song_id: u256,
            revenue: u256
        ) {
            let artist = self.music_track_artist.entry(song_id).read();
            assert(get_caller_address() == artist, 'Only artist can distribute');

            let current_revenue = self.music_track_revenue.entry(song_id).read();
            self.music_track_revenue.entry(song_id).write(current_revenue + revenue);

            self.emit(Event::RevenueDistributed(RevenueDistributed {
                song_id,
                total_revenue: revenue
            }));
        }

        fn get_song_details(
            self: @ContractState, 
            song_id: u256
        ) -> (felt252, felt252, felt252, felt252, u256, u256) {
            (
                self.music_track_name.entry(song_id).read(),
                self.music_track_genre.entry(song_id).read(),
                self.music_track_audio_hash.entry(song_id).read(),
                self.music_track_artwork_hash.entry(song_id).read(),
                self.music_track_total_shares.entry(song_id).read(),
                self.music_track_share_price.entry(song_id).read()
            )
        }

        fn get_shareholders(
            self: @ContractState,
            song_id: u256
        ) -> (Span<ContractAddress>, Span<u256>) {
            let mut shareholders: Array<ContractAddress> = ArrayTrait::new();
            let mut shares: Array<u256> = ArrayTrait::new();
            
            // Note: This is a simplified version. In practice, you'd need to 
            // implement proper shareholder tracking
            
            (shareholders.span(), shares.span())
        }

        fn get_all_song_ids(self: @ContractState) -> Span<u256> {
            let mut ids: Array<u256> = ArrayTrait::new();
            let length = self.song_ids_length.read();
            
            let mut i: u256 = 0;
            loop {
                if i >= length {
                    break;
                }
                ids.append(self.all_song_ids.entry(i).read());
                i += 1;
            };
            
            ids.span()
        }
    }
}
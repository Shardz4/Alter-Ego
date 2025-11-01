module senztrade::perception_market {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_MARKET_NOT_FOUND: u64 = 3;
    const E_MARKET_EXPIRED: u64 = 4;
    const E_MARKET_NOT_EXPIRED: u64 = 5;
    const E_MARKET_ALREADY_SETTLED: u64 = 6;
    const E_INVALID_AMOUNT: u64 = 7;
    const E_INVALID_PERCENTAGE: u64 = 8;
    const E_UNAUTHORIZED: u64 = 9;
    const E_INSUFFICIENT_BALANCE: u64 = 10;

    /// Market structure representing a prediction market
    struct Market has store, copy, drop {
        id: u64,
        question: String,
        creator: address,
        resolve_ts: u64,
        total_yes_shares: u64,
        total_no_shares: u64,
        total_yes_volume: u64,
        total_no_volume: u64,
        settled: bool,
        result: bool, // true = YES won, false = NO won
        created_at: u64,
    }

    /// User position in a market with perception data
    struct Position has store, copy, drop {
        market_id: u64,
        user: address,
        yes_shares: u64,
        no_shares: u64,
        yes_cost: u64,
        no_cost: u64,
        // Perception data: "How many % would agree with you?"
        agreement_percentage: u8, // 0-100
        prediction_side: bool, // true = YES, false = NO
    }

    /// Global market registry
    struct MarketRegistry has key {
        markets: vector<Market>,
        next_market_id: u64,
        admin: address,
        market_created_events: EventHandle<MarketCreatedEvent>,
        trade_executed_events: EventHandle<TradeExecutedEvent>,
        market_settled_events: EventHandle<MarketSettledEvent>,
    }

    /// User positions storage
    struct UserPositions has key {
        positions: vector<Position>,
    }

    /// Events
    struct MarketCreatedEvent has drop, store {
        market_id: u64,
        question: String,
        creator: address,
        resolve_ts: u64,
        timestamp: u64,
    }

    struct TradeExecutedEvent has drop, store {
        market_id: u64,
        user: address,
        is_yes: bool,
        amount: u64,
        shares: u64,
        agreement_percentage: u8,
        timestamp: u64,
    }

    struct MarketSettledEvent has drop, store {
        market_id: u64,
        result: bool,
        timestamp: u64,
    }

    /// Initialize the market registry (called once by admin)
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<MarketRegistry>(admin_addr), E_ALREADY_INITIALIZED);

        move_to(admin, MarketRegistry {
            markets: vector::empty(),
            next_market_id: 0,
            admin: admin_addr,
            market_created_events: account::new_event_handle<MarketCreatedEvent>(admin),
            trade_executed_events: account::new_event_handle<TradeExecutedEvent>(admin),
            market_settled_events: account::new_event_handle<MarketSettledEvent>(admin),
        });
    }

    /// Create a new prediction market
    public entry fun create_market(
        creator: &signer,
        question: String,
        resolve_ts: u64,
    ) acquires MarketRegistry {
        let creator_addr = signer::address_of(creator);
        let registry_addr = @senztrade;
        
        assert!(exists<MarketRegistry>(registry_addr), E_NOT_INITIALIZED);
        
        let registry = borrow_global_mut<MarketRegistry>(registry_addr);
        let market_id = registry.next_market_id;
        let now = timestamp::now_seconds();
        
        assert!(resolve_ts > now, E_MARKET_EXPIRED);

        let market = Market {
            id: market_id,
            question,
            creator: creator_addr,
            resolve_ts,
            total_yes_shares: 0,
            total_no_shares: 0,
            total_yes_volume: 0,
            total_no_volume: 0,
            settled: false,
            result: false,
            created_at: now,
        };

        vector::push_back(&mut registry.markets, market);
        registry.next_market_id = market_id + 1;

        event::emit_event(&mut registry.market_created_events, MarketCreatedEvent {
            market_id,
            question,
            creator: creator_addr,
            resolve_ts,
            timestamp: now,
        });
    }

    /// Buy YES shares with perception data
    public entry fun buy_yes(
        user: &signer,
        market_id: u64,
        amount: u64,
        agreement_percentage: u8,
    ) acquires MarketRegistry, UserPositions {
        assert!(agreement_percentage <= 100, E_INVALID_PERCENTAGE);
        assert!(amount > 0, E_INVALID_AMOUNT);
        
        let user_addr = signer::address_of(user);
        let registry_addr = @senztrade;
        
        assert!(exists<MarketRegistry>(registry_addr), E_NOT_INITIALIZED);
        
        let registry = borrow_global_mut<MarketRegistry>(registry_addr);
        assert!(market_id < vector::length(&registry.markets), E_MARKET_NOT_FOUND);
        
        let market = vector::borrow_mut(&mut registry.markets, market_id);
        let now = timestamp::now_seconds();
        
        assert!(now < market.resolve_ts, E_MARKET_EXPIRED);
        assert!(!market.settled, E_MARKET_ALREADY_SETTLED);

        // Calculate shares using simple 1:1 ratio (can be enhanced with CPMM)
        let shares = amount;
        
        // Update market totals
        market.total_yes_shares = market.total_yes_shares + shares;
        market.total_yes_volume = market.total_yes_volume + amount;

        // Update or create user position
        if (!exists<UserPositions>(user_addr)) {
            move_to(user, UserPositions {
                positions: vector::empty(),
            });
        };

        let user_positions = borrow_global_mut<UserPositions>(user_addr);
        let position_index = find_position(&user_positions.positions, market_id);
        
        if (position_index < vector::length(&user_positions.positions)) {
            let position = vector::borrow_mut(&mut user_positions.positions, position_index);
            position.yes_shares = position.yes_shares + shares;
            position.yes_cost = position.yes_cost + amount;
            position.agreement_percentage = agreement_percentage;
            position.prediction_side = true;
        } else {
            let new_position = Position {
                market_id,
                user: user_addr,
                yes_shares: shares,
                no_shares: 0,
                yes_cost: amount,
                no_cost: 0,
                agreement_percentage,
                prediction_side: true,
            };
            vector::push_back(&mut user_positions.positions, new_position);
        };

        event::emit_event(&mut registry.trade_executed_events, TradeExecutedEvent {
            market_id,
            user: user_addr,
            is_yes: true,
            amount,
            shares,
            agreement_percentage,
            timestamp: now,
        });
    }

    /// Buy NO shares with perception data
    public entry fun buy_no(
        user: &signer,
        market_id: u64,
        amount: u64,
        agreement_percentage: u8,
    ) acquires MarketRegistry, UserPositions {
        assert!(agreement_percentage <= 100, E_INVALID_PERCENTAGE);
        assert!(amount > 0, E_INVALID_AMOUNT);
        
        let user_addr = signer::address_of(user);
        let registry_addr = @senztrade;
        
        assert!(exists<MarketRegistry>(registry_addr), E_NOT_INITIALIZED);
        
        let registry = borrow_global_mut<MarketRegistry>(registry_addr);
        assert!(market_id < vector::length(&registry.markets), E_MARKET_NOT_FOUND);
        
        let market = vector::borrow_mut(&mut registry.markets, market_id);
        let now = timestamp::now_seconds();
        
        assert!(now < market.resolve_ts, E_MARKET_EXPIRED);
        assert!(!market.settled, E_MARKET_ALREADY_SETTLED);

        // Calculate shares using simple 1:1 ratio
        let shares = amount;
        
        // Update market totals
        market.total_no_shares = market.total_no_shares + shares;
        market.total_no_volume = market.total_no_volume + amount;

        // Update or create user position
        if (!exists<UserPositions>(user_addr)) {
            move_to(user, UserPositions {
                positions: vector::empty(),
            });
        };

        let user_positions = borrow_global_mut<UserPositions>(user_addr);
        let position_index = find_position(&user_positions.positions, market_id);
        
        if (position_index < vector::length(&user_positions.positions)) {
            let position = vector::borrow_mut(&mut user_positions.positions, position_index);
            position.no_shares = position.no_shares + shares;
            position.no_cost = position.no_cost + amount;
            position.agreement_percentage = agreement_percentage;
            position.prediction_side = false;
        } else {
            let new_position = Position {
                market_id,
                user: user_addr,
                yes_shares: 0,
                no_shares: shares,
                yes_cost: 0,
                no_cost: amount,
                agreement_percentage,
                prediction_side: false,
            };
            vector::push_back(&mut user_positions.positions, new_position);
        };

        event::emit_event(&mut registry.trade_executed_events, TradeExecutedEvent {
            market_id,
            user: user_addr,
            is_yes: false,
            amount,
            shares,
            agreement_percentage,
            timestamp: now,
        });
    }

    /// Settle a market (admin only)
    public entry fun settle_market(
        admin: &signer,
        market_id: u64,
        result: bool, // true = YES wins, false = NO wins
    ) acquires MarketRegistry {
        let admin_addr = signer::address_of(admin);
        let registry_addr = @senztrade;

        assert!(exists<MarketRegistry>(registry_addr), E_NOT_INITIALIZED);

        let registry = borrow_global_mut<MarketRegistry>(registry_addr);
        assert!(admin_addr == registry.admin, E_UNAUTHORIZED);
        assert!(market_id < vector::length(&registry.markets), E_MARKET_NOT_FOUND);

        let market = vector::borrow_mut(&mut registry.markets, market_id);
        let now = timestamp::now_seconds();

        assert!(now >= market.resolve_ts, E_MARKET_NOT_EXPIRED);
        assert!(!market.settled, E_MARKET_ALREADY_SETTLED);

        market.settled = true;
        market.result = result;

        event::emit_event(&mut registry.market_settled_events, MarketSettledEvent {
            market_id,
            result,
            timestamp: now,
        });
    }

    /// View function: Get market details
    #[view]
    public fun get_market(market_id: u64): (String, address, u64, u64, u64, u64, u64, bool, bool) acquires MarketRegistry {
        let registry_addr = @senztrade;
        assert!(exists<MarketRegistry>(registry_addr), E_NOT_INITIALIZED);

        let registry = borrow_global<MarketRegistry>(registry_addr);
        assert!(market_id < vector::length(&registry.markets), E_MARKET_NOT_FOUND);

        let market = vector::borrow(&registry.markets, market_id);
        (
            market.question,
            market.creator,
            market.resolve_ts,
            market.total_yes_shares,
            market.total_no_shares,
            market.total_yes_volume,
            market.total_no_volume,
            market.settled,
            market.result
        )
    }

    /// View function: Get all markets count
    #[view]
    public fun get_markets_count(): u64 acquires MarketRegistry {
        let registry_addr = @senztrade;
        if (!exists<MarketRegistry>(registry_addr)) {
            return 0
        };
        let registry = borrow_global<MarketRegistry>(registry_addr);
        vector::length(&registry.markets)
    }

    /// View function: Get user position
    #[view]
    public fun get_user_position(user: address, market_id: u64): (u64, u64, u64, u64, u8, bool) acquires UserPositions {
        if (!exists<UserPositions>(user)) {
            return (0, 0, 0, 0, 0, true)
        };

        let user_positions = borrow_global<UserPositions>(user);
        let position_index = find_position(&user_positions.positions, market_id);

        if (position_index < vector::length(&user_positions.positions)) {
            let position = vector::borrow(&user_positions.positions, position_index);
            (
                position.yes_shares,
                position.no_shares,
                position.yes_cost,
                position.no_cost,
                position.agreement_percentage,
                position.prediction_side
            )
        } else {
            (0, 0, 0, 0, 0, true)
        }
    }

    /// View function: Calculate current price (simple ratio)
    #[view]
    public fun get_market_price(market_id: u64): u64 acquires MarketRegistry {
        let registry_addr = @senztrade;
        assert!(exists<MarketRegistry>(registry_addr), E_NOT_INITIALIZED);

        let registry = borrow_global<MarketRegistry>(registry_addr);
        assert!(market_id < vector::length(&registry.markets), E_MARKET_NOT_FOUND);

        let market = vector::borrow(&registry.markets, market_id);
        let total = market.total_yes_shares + market.total_no_shares;

        if (total == 0) {
            return 50 // 50% default
        };

        // Return YES price as percentage (0-100)
        ((market.total_yes_shares * 100) / total)
    }

    /// Helper function to find position index
    fun find_position(positions: &vector<Position>, market_id: u64): u64 {
        let len = vector::length(positions);
        let i = 0;
        while (i < len) {
            let pos = vector::borrow(positions, i);
            if (pos.market_id == market_id) {
                return i
            };
            i = i + 1;
        };
        len
    }
}


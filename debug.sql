SELECT 'ORDERS' as section, id::text, buyer_id::text, farmer_id::text, auction_id::text, product_id::text, payment_status, amount::text FROM orders ORDER BY id;
SELECT 'AUCTIONS' as section, id::text, status, winner_id::text, product_id::text FROM auctions ORDER BY id;
SELECT 'USERS' as section, id::text, name, role FROM users ORDER BY id;
SELECT 'BIDS' as section, b.id::text, b.auction_id::text, b.user_id::text, b.bid_amount::text FROM bids b ORDER BY b.auction_id, b.bid_amount DESC;

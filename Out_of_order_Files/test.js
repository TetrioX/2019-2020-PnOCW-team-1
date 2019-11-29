
("input[name*='group1']").click(function(){
    $.ajax({

    success: function(){
        $.ajax({
            success:function(){
                $.ajax({});
            }
        });
    }
    });
});